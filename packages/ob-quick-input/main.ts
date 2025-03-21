import Fuse from 'fuse.js';
import pinyin from "pinyin";
import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, Notice, Plugin, PluginSettingTab, Setting, TFile, getLinkpath, parseLinktext, setIcon } from 'obsidian';
import { QuickTextView, QUICK_TEXT_VIEW } from "./quickTextView";

interface ObsidianDemoPluginSettings {
  rolePrefix: string;
  allPrefix: string;
  alwaysShowFileName: boolean;
}

const DEFAULT_SETTINGS: ObsidianDemoPluginSettings = {
  rolePrefix: '@',
  allPrefix: '==',
  alwaysShowFileName: false
}

export default class ObsidianDemoPlugin extends Plugin {
  settings: ObsidianDemoPluginSettings;

  async onload() {
    await this.loadSettings();

    // 注册侧边栏视图
    this.registerView(
      QUICK_TEXT_VIEW,
      (leaf) => new QuickTextView(leaf)
    );

    // 添加打开面板的命令
    this.addCommand({
      id: "show-quick-text-panel",
      name: "show quick panel 显示快捷文本面板",
      callback: () => this.activateView()
    });

    this.registerEditorSuggest(new EditorInputSuggest(this.app, this))

    this.addSettingTab(new ObsidianDemoSettingTab(this.app, this));
  }

  async activateView() {
    this.app.workspace.detachLeavesOfType(QUICK_TEXT_VIEW);
    await this.app.workspace.getRightLeaf(false).setViewState({
      type: QUICK_TEXT_VIEW,
      active: true,
    });
  }

  onunload() {
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
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

