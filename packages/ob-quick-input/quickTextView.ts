import { ItemView, WorkspaceLeaf } from "obsidian";
import { EditorView } from "@codemirror/view";

export const QUICK_TEXT_VIEW = "quick-text-view";

export class QuickTextView extends ItemView {
  private quickTexts: { id: number; text: string }[] = [];

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType(): string {
    return QUICK_TEXT_VIEW;
  }

  getDisplayText(): string {
    return "快捷文本面板";
  }

  getIcon(): string {
    return "file-text";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    
    // 面板头部
    const header = container.createDiv("quick-text-header");
    header.createEl("h3", { text: "快捷文本列表" });
    
    // 输入容器
    const inputContainer = container.createDiv("quick-text-input-container");
    const textarea = inputContainer.createEl("textarea", {
      attr: { placeholder: "输入快捷文本...", rows: "4" },
      cls: "quick-text-input"
    });
    
    // 确认按钮
    const confirmBtn = inputContainer.createEl("button", { 
      text: "确认添加",
      cls: "mod-cta"
    });
    confirmBtn.onclick = () => this.addNewText(textarea.value);
    
    // 列表容器
    this.quickTexts = this.app.loadLocalStorage("quick-texts") || [];
    const listContainer = container.createDiv("quick-text-list");
    this.renderList(listContainer);
  }

  private renderList(container: HTMLDivElement) {
    container.empty();
    this.quickTexts.forEach((item, index) => {
      const itemEl = container.createDiv("quick-text-item");
      itemEl.createSpan({ text: `${index + 1}. ` });
      itemEl.createSpan({ text: item.text.slice(0, 20) + "..." });
      
      // 插入按钮
      const insertBtn = itemEl.createEl("button", { text: "插入" });
      insertBtn.onclick = () => this.insertText(item.text);
      
      // 删除按钮
      const deleteBtn = itemEl.createEl("button", { text: "×" });
      deleteBtn.onclick = () => this.deleteText(item.id);
    });
  }

  private async addNewText(newText: string) {
    if (newText.trim()) {
      this.quickTexts.push({
        id: Date.now(),
        text: newText
      });
      this.app.saveLocalStorage("quick-texts", this.quickTexts);
      this.renderList(this.containerEl.querySelector(".quick-text-list")!);
      this.containerEl.querySelector(".quick-text-input")!.value = "";
    }
  }

  private insertText(text: string) {
    const activeView = this.app.workspace.getActiveViewOfType(EditorView);
    if (activeView) {
      const selection = activeView.state.selection.main;
      activeView.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: text
        }
      });
    }
  }

  private deleteText(id: number) {
    this.quickTexts = this.quickTexts.filter(item => item.id !== id);
    this.app.saveLocalStorage("quick-texts", this.quickTexts);
    this.renderList(this.containerEl.querySelector(".quick-text-list")!);
  }
}