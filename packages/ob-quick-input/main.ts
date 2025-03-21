import Fuse from 'fuse.js';
import pinyin from "pinyin";
import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile, getLinkpath, parseLinktext, setIcon, WorkspaceLeaf, ItemView } from 'obsidian';
import { QuickTextView, QUICK_TEXT_VIEW } from "./quickTextView";


interface TextShortcut {
  id: string;
  text: string;
}
interface ObsidianDemoPluginSettings {
  rolePrefix: string;
  allPrefix: string;
  alwaysShowFileName: boolean;
  shortcuts: TextShortcut[];
}


const DEFAULT_SETTINGS: ObsidianDemoPluginSettings = {
  rolePrefix: '@',
  allPrefix: '==',
  alwaysShowFileName: false,
  shortcuts: [
    { id: '1', text: '张三' },
    { id: '2', text: '李四' },
    { id: '3', text: '王五' },
    { id: '4', text: '\n---\n' }
  ],
}

const VIEW_TYPE_TEXT_SHORTCUTS = 'text-shortcuts-view';

export default class ObsidianDemoPlugin extends Plugin {
  settings: ObsidianDemoPluginSettings;

  async onload() {
    await this.loadSettings();

    // Register view type
    this.registerView(
      VIEW_TYPE_TEXT_SHORTCUTS,
      (leaf) => new TextShortcutsView(leaf, this)
    );
    // Add ribbon icon for showing the shortcuts panel
    this.addRibbonIcon('text', 'Text Shortcuts', () => {
      this.activateView();
    });

    // Add command for showing the shortcuts panel
    this.addCommand({
      id: 'show-quick-text-shortcuts',
      name: 'Show Text Shortcuts Panel 显示快捷文本面板',
      callback: () => {
        this.activateView();
      },
    });
    // Add commands for each shortcut
    this.registerShortcutCommands();

    this.registerEditorSuggest(new EditorInputSuggest(this.app, this))

    this.addSettingTab(new ObsidianDemoSettingTab(this.app, this));

    if (this.app.workspace.layoutReady) {
      this.activateView();
    }
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_TEXT_SHORTCUTS);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.registerShortcutCommands();
  }

  private registerShortcutCommands() {
    // Remove existing shortcut commands
    const commands = (this.app as any).commands;
    if (commands && typeof commands.listCommands === 'function') {
      commands.listCommands()
        .filter((cmd: any) => cmd.id.startsWith('text-shortcuts:insert-shortcut-'))
        .forEach((cmd: any) => {
          commands.removeCommand(cmd.id);
        });
    }

    // Add commands for each shortcut
    this.settings.shortcuts.forEach((shortcut, index) => {
      this.addCommand({
        id: `insert-shortcut-${index + 1}`,
        name: `Insert Shortcut ${index + 1}: ${shortcut.text.substring(0, 20)}${shortcut.text.length > 20 ? '...' : ''}`,
        hotkeys: [{ modifiers: ['Alt'], key: `${index + 1}` }],
        editorCallback: (editor: Editor) => {
          this.insertShortcutText(editor, shortcut.text);
        },
      });
    });
  }

  private insertShortcutText(editor: Editor, text: string) {
    // Process template variables
    const processedText = text.replace(/{{date}}/g, new Date().toLocaleDateString());

    // Insert the text at the cursor position
    const cursor = editor.getCursor();
    editor.replaceRange(processedText, cursor);

    // Move the cursor to the end of the inserted text
    const newCursor = {
      line: cursor.line,
      ch: cursor.ch + processedText.length
    };
    editor.setCursor(newCursor);
  }

  private async activateView() {
    const { workspace } = this.app;

    // Check if view is already open
    const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE_TEXT_SHORTCUTS);
    if (existingLeaves.length > 0) {
      workspace.revealLeaf(existingLeaves[0]);
      return;
    }

    // Create a new leaf in the specified position
    const leaf = workspace.getLeftLeaf(false);

    if (!leaf) return;

    await leaf.setViewState({
      type: VIEW_TYPE_TEXT_SHORTCUTS,
      active: true,
    });

    workspace.revealLeaf(leaf);
  }
}

class ObsidianDemoSettingTab extends PluginSettingTab {
  plugin: ObsidianDemoPlugin;

  constructor(app: App, plugin: ObsidianDemoPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('角色前缀')
      .setDesc('调取角色名称下拉的前缀')
      .addText(text => text
        .setPlaceholder('留空时默认值为' + DEFAULT_SETTINGS.rolePrefix)
        .setValue(this.plugin.settings.rolePrefix)
        .onChange(async (value) => {
          this.plugin.settings.rolePrefix = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('所有文件前缀')
      .setDesc('调取所有文件下拉的前缀')
      .addText(text => text
        .setPlaceholder('留空时默认值为' + DEFAULT_SETTINGS.allPrefix)
        .setValue(this.plugin.settings.allPrefix)
        .onChange(async (value) => {
          this.plugin.settings.allPrefix = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('链接文本始终使用文件名显示')
      .setDesc('当有重名时推荐启用，最终格式为 `[[文件路径/文件名|文件名]]`')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.alwaysShowFileName)
        .onChange(async (value) => {
          this.plugin.settings.alwaysShowFileName = value;
          await this.plugin.saveSettings();
        }));
  }
}


class EditorInputSuggest extends EditorSuggest<TFile> {
  plugin: ObsidianDemoPlugin

  constructor(app: App, plugin: ObsidianDemoPlugin) {
    super(app)
    this.plugin = plugin
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _: TFile
  ): EditorSuggestTriggerInfo | null {
    const sub = editor.getLine(cursor.line).substring(0, cursor.ch)
    const regex = new RegExp(`(${this.plugin.settings.rolePrefix}|${this.plugin.settings.allPrefix})\\S*$`)
    const match = sub.match(regex)?.first()
    console.log('match', match, regex, typeof regex)
    if (match) {
      console.log('match', match)
      return {
        end: cursor,
        start: {
          ch: sub.lastIndexOf(match),
          line: cursor.line,
        },
        query: match,
      }
    }
    return null
  }

  getSuggestions(context: EditorSuggestContext): TFile[] {
    // const files = this.app.vault.getAllLoadedFiles();
    const files = this.app.vault.getMarkdownFiles();
    const queryRole = context.query.startsWith(this.plugin.settings.rolePrefix)
    let newFiles = this.addFilesMeta(files);
    if (queryRole) {
      newFiles = newFiles.filter(file => file.isRole)
    }
    console.log('newfiles', newFiles)
    const fuse = new Fuse(newFiles, {
      threshold: 0.5,
      // keys: ['basename', 'pinyin', 'jianpin', 'path', 'type', 'tag', 'alias']
      keys: [
        { name: 'jianpin', weight: 1.0 },
        { name: 'basename', weight: 0.9 },
        { name: 'jianpin', weight: 0.8 },
        { name: 'pinyin', weight: 0.7 },
        { name: 'path', weight: 0.6 },
        { name: 'alias', weight: 0.5 }
      ]
    })
    const query = context.query.replace(this.plugin.settings.rolePrefix, "").replace(this.plugin.settings.allPrefix, "")
    return (query ? fuse.search(query).map(x => x.item) : newFiles) as TFile[];
  }

  renderSuggestion(suggestion: TFile, el: HTMLElement): void {
    const outer = el.createDiv({ cls: "obsidian-demo-container" });
    const left = outer.createDiv({ cls: "left" })
    left.createDiv({ cls: 'left-short' }).setText(suggestion.basename)
    left.createEl('small', { text: `${suggestion.jianpin ? `[${suggestion.jianpin}] ` : ''}${suggestion.path}` })
    // const right = outer.createDiv({ cls: "right" })
    // setIcon(right, 'plus')
    // this.plugin.registerDomEvent(right, 'click', (evt: MouseEvent) => {
    //   new Notice('Go to hotkeys');
    //   evt.preventDefault();
    //   evt.stopPropagation();
    // })
  }

  couldUseFilenameWikiLink(suggestion: TFile): boolean {
    const r = this.app.metadataCache.getFirstLinkpathDest(suggestion.basename, this.context.file?.path)
    return suggestion.path === r?.path
  }

  getWikiLink(suggestion: TFile): string {
    let wikiText = '';
    if (this.couldUseFilenameWikiLink(suggestion)) {
      wikiText = suggestion.basename
    } else {
      wikiText = suggestion.path.replace(/\.md$/i, '')
    }
    if (this.plugin.settings.alwaysShowFileName) {
      wikiText += `|${suggestion.basename}`
    }
    return `[[${wikiText}]]`
  }

  selectSuggestion(suggestion: TFile): void {
    if (this.context) {
      const editor: Editor = (this.context.editor as Editor)
      // let wikiLink = ''
      // if (!suggestion.isDuplicate) {
      //   wikiLink = suggestion.showname ? `[[${suggestion.basename}|${suggestion.showname}]]` : `[[${suggestion.basename}]]`
      // } else {
      //   wikiLink = `[[${suggestion.path.replace(/\.md$/i, '')}|${suggestion.basename}]]`
      // }

      const wikiLink = this.getWikiLink(suggestion)
      editor.replaceRange(
        wikiLink,
        this.context.start,
        this.context.end
      )
    }
  }
  addFileMeta(file: TFile, allNames: string[]) {
    const meta = this.app.metadataCache.getFileCache(file)
    const isRole = file.path.startsWith('c/') || meta?.frontmatter?.type === 'role'
    const isDuplicate = allNames.filter(x => x === file.basename).length > 1
    return Object.assign({}, file, {
      type: meta?.frontmatter?.type,
      tag: meta?.frontmatter?.tag?.join('|') || '',
      alias: meta?.frontmatter?.aliases?.join('|') || '',
      isRole,
      showname: meta?.frontmatter?.showname,
      isDuplicate,
      pinyin: pinyin(file.basename, {
        style: 'normal',
        mode: isRole ? 'surname' : 'normal', // 姓名模式。
      })
        .map((x: any) => x[0])
        .join(''),
      jianpin: pinyin(file.basename, {  // 简拼
        style: 'first_letter',
        mode: isRole ? 'surname' : 'normal',
      })
        .map((x: any) => x[0])
        .join(''),
    })
  }
  addFilesMeta(files: TFile[]) {
    const allNames = this.app.vault.getMarkdownFiles().map(f => f.basename)
    return files.map(file => this.addFileMeta(file, allNames))
  }
}

class TextShortcutsView extends ItemView {
  plugin: ObsidianDemoPlugin;
  private shortcutsEl: HTMLElement;
  private newShortcutTextarea: HTMLTextAreaElement;

  constructor(leaf: WorkspaceLeaf, plugin: ObsidianDemoPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_TEXT_SHORTCUTS;
  }

  getDisplayText(): string {
    return 'Text Shortcuts';
  }

  getIcon(): string {
    return 'text';
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('text-shortcuts-container');

    // Create header
    const headerEl = contentEl.createEl('div', { cls: 'text-shortcuts-header' });
    headerEl.createEl('h2', { text: 'Text Shortcuts' });

    // Create help text
    const helpEl = contentEl.createEl('div', { cls: 'text-shortcuts-help' });
    helpEl.createEl('p', {
      text: 'Use Alt+[number] to quickly insert shortcuts at cursor position.',
      cls: 'text-shortcuts-help-text'
    });

    // Create shortcuts list
    this.shortcutsEl = contentEl.createEl('div', { cls: 'text-shortcuts-list' });
    this.renderShortcuts();

    // Create new shortcut section
    const newShortcutEl = contentEl.createEl('div', { cls: 'text-shortcuts-new' });
    newShortcutEl.createEl('h3', { text: 'Add New Shortcut', cls: 'text-shortcuts-subheading' });

    this.newShortcutTextarea = newShortcutEl.createEl('textarea', {
      cls: 'text-shortcuts-textarea',
      attr: { placeholder: 'Enter shortcut text...' }
    });

    const buttonContainer = newShortcutEl.createEl('div', { cls: 'text-shortcuts-button-container' });
    const addButton = buttonContainer.createEl('button', {
      cls: 'text-shortcuts-add-button',
      text: 'Add Shortcut'
    });

    addButton.addEventListener('click', () => {
      this.addShortcut();
    });
  }

  private renderShortcuts() {
    this.shortcutsEl.empty();
    this.shortcutsEl.createEl('h3', { text: 'Available Shortcuts', cls: 'text-shortcuts-subheading' });

    const listEl = this.shortcutsEl.createEl('div', { cls: 'text-shortcuts-items' });

    this.plugin.settings.shortcuts.forEach((shortcut, index) => {
      const shortcutEl = listEl.createEl('div', { cls: 'text-shortcuts-item' });

      const numberEl = shortcutEl.createEl('div', { cls: 'text-shortcuts-number' });
      numberEl.setText(`${index + 1}`);

      const textEl = shortcutEl.createEl('div', { cls: 'text-shortcuts-text' });
      textEl.setText(shortcut.text.length > 50
        ? shortcut.text.substring(0, 50) + '...'
        : shortcut.text);

      textEl.addEventListener('click', () => {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          this.plugin.insertShortcutText(activeView.editor, shortcut.text);
          new Notice('Shortcut inserted');
        }
      });

      const deleteEl = shortcutEl.createEl('div', { cls: 'text-shortcuts-delete' });
      deleteEl.innerHTML = '×';
      deleteEl.addEventListener('click', () => {
        this.removeShortcut(shortcut.id);
      });
    });
  }

  private addShortcut() {
    const text = this.newShortcutTextarea.value.trim();
    if (!text) return;

    const newId = Date.now().toString();
    this.plugin.settings.shortcuts.push({ id: newId, text });
    this.plugin.saveSettings();
    this.renderShortcuts();
    this.newShortcutTextarea.value = '';

    new Notice('Shortcut added');
  }

  private removeShortcut(id: string) {
    this.plugin.settings.shortcuts = this.plugin.settings.shortcuts.filter(s => s.id !== id);
    this.plugin.saveSettings();
    this.renderShortcuts();

    new Notice('Shortcut removed');
  }

  async onClose() {
    this.contentEl.empty();
  }
}