# Note section 11

#### 118 Issues with eager bundling

submit ボタンをなくして、

ユーザ入力内容を自動的に読み取ってバンドリングする方法に変えてみる

```TypeScript
const App = () => {
  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState('');

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
    });
  };
  useEffect(() => {
    startService();
  }, []);

  const onClick = async (input: string) => {
    if (!ref.current) {
      return;
    }

    iframe.current.srcdoc = html;

    const result = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    // setCode(result.outputFiles[0].text);
    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
  };

  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('message', (event) => {
            try {
              eval(event.data);
            } catch (err) {
              const root = document.querySelector('#root');
              root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
              console.error(err);
            }
          }, false);
        </script>
      </body>
    </html>
  `;

  return (
    <div>
      <textarea
        value={input}
        // 入力を常にバンドリングを処理するonClickメソッドへ
        onChange={(e) => {
            setInput(e.target.value);
            onClick(input);
            }}
      ></textarea>
      <div>
        // <button onClick={onClick}>Submit</button>
      </div>
      <iframe ref={iframe} sandbox="allow-scripts" srcDoc={html} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));

```

chrome のタスクマネージャから CPU の負荷状況をモニタしてみよう

するとめっちゃ負荷がかかっているのが確認できる

ということで入力にすぐ応じてバンドリングするのではなくて

0.5 秒ずつまってからバンドリングする方法で実装してみる

#### 119 Quick Revert

#### 120 Options for Open Source Editor

3 つの有力なオープンソースエディタがある

-   Manoco Editor: 設定が難しいけど動くと完璧な編集機能を有する

React にこの難しい設定をやってくれるコンポーネントがあるらしい。

```bash
$ npm i --save-exact @monaco-editor/react
```

とにかくこいつを導入して

見栄えが良くて、

エディタとしての機能を十分発揮してくれる

エディタコンポーネントを導入・実装する

#### 121 Display Edtitor

```TypeScript
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = () => {
    return <MonacoEditor height="500px" />;
};

export default CodeEditor;

```

こいつを index.tsx で取り込んで表示させる

#### 122 Configuration the Editor

```TypeScript

declare const Editor: React.FC<EditorProps>;

export interface EditorProps {
    //　エディタの構成プロパティ
}
```

<MonacoEdtor />のにわたせる props は EditorProps で定義されている

先の height とか。

#### 123 Eidtor Type Defs

Monaco エディタのオプションをいじる

先の`interface EditorProps`の`options`プロパティについて

options プロパティのインタフェイスは`IStandaloneEditorConstructionOptions`

上記の interface は以下の継承である。

`IEditorConstructionOptions` extends `IEditorOptions`

講義のバージョンは取得できなかったので最新のバージョンを使っていることによる多少の違いがみられることは注意

ひとまずのオプション

```TypeScript
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = () => {
    return (
        <MonacoEditor
            height="500px"
            theme="vs-dark"
            language="javascript"
            options={{
                wordWrap: 'on',
                minimap: { enabled: false },
                showUnused: false,
                folding: false,
                lineNumbersMinChars: 3,
                fontSize: 16,
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
        />
    );
};

export default CodeEditor;
```

#### 125: setting the initial value

エディタが初期値を受け取るようにする

MonacoEditor には`defaultValue`というプロパティがあるが、

親コンポーネントから受け取るようにしたいので

value プロパティに props 経由で渡すようにする

```TypeScript
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
    initialValue: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue }) => {

    return (
        <MonacoEditor
            value={initialValue}
            height="500px"
            theme="vs-dark"
            language="javascript"
            options={{
                wordWrap: 'on',
                minimap: { enabled: false },
                showUnused: false,
                folding: false,
                lineNumbersMinChars: 3,
                fontSize: 16,
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
        />
    );
};

export default CodeEditor;
```

props として initialValue を受け取って、初期値としてエディタに記述する

#### 126: Handlign editor change event

エディタに入力されたコードを読み取ってバンドラに渡せるようにする

https://github.com/suren-atoyan/monaco-react#get-value

講義のバージョンと異なるため、editorDidMount プロパティが最新バージョンでは存在しない

その件について Q＆A で回答あり

https://www.udemy.com/course/react-and-typescript-build-a-portfolio-project/learn/lecture/24209728#questions/13823168

最新バージョンでもなくて、講義で使っている`@monaco-editor/react v3.7.4 `でもなくて、

`@monaco-editor/react v3.7.5 `を使うとうまくいくらしい。

講義もあとでアップデートするらしい。

## 講義とのバージョン違いに依る部分の乖離解消

公式を基に作成

```TypeScript
import { useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
    initialValue: string;
    onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
    const editorRef = useRef(null);
    const onEditorDidMount = (
      // any を付けているのは公式のサンプルより
      editor: any,
      monacoEditor: any) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent(() => {
            if (!editorRef.current) return;
            onChange(editor.getValue());
        });
    };

    return (
        <MonacoEditor
            // editorDidMount={onEditorDidMount}
            onMount={onEditorDidMount}
            // ...
        />
    );
};

export default CodeEditor;
```

<MonacoEditor />の onMount プロパティの型は...

```TypeScript

export type OnMount = (
  editor: monaco.editor.IStandaloneCodeEditor,
  monaco: Monaco,
) => void;

// monaco
export type Monaco = typeof monaco;

export interface IStandaloneCodeEditor extends ICodeEditor {
    updateOptions(newOptions: IEditorOptions & IGlobalEditorOptions): void;
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T>(key: string, defaultValue: T): IContextKey<T>;
    addAction(descriptor: IActionDescriptor): IDisposable;
}

    export interface ICodeEditor extends IEditor {
        /**
         * An event emitted when the content of the current model has changed.
         * @event
         */
        readonly onDidChangeModelContent: IEvent<IModelContentChangedEvent>;
        /**
         * An event emitted when the language of the current model has changed.
         * @event
         */
        readonly onDidChangeModelLanguage: IEvent<IModelLanguageChangedEvent>;
        /**
         * An event emitted when the language configuration of the current model has changed.
         * @event
         */
        readonly onDidChangeModelLanguageConfiguration: IEvent<IModelLanguageConfigurationChangedEvent>;
        /**
         * An event emitted when the options of the current model has changed.
         * @event
         */
        readonly onDidChangeModelOptions: IEvent<IModelOptionsChangedEvent>;
        /**
         * An event emitted when the configuration of the editor has changed. (e.g. `editor.updateOptions()`)
         * @event
         */
        readonly onDidChangeConfiguration: IEvent<ConfigurationChangedEvent>;
        /**
         * An event emitted when the cursor position has changed.
         * @event
         */
        readonly onDidChangeCursorPosition: IEvent<ICursorPositionChangedEvent>;
        /**
         * An event emitted when the cursor selection has changed.
         * @event
         */
        readonly onDidChangeCursorSelection: IEvent<ICursorSelectionChangedEvent>;
        /**
         * An event emitted when the model of this editor has changed (e.g. `editor.setModel()`).
         * @event
         */
        readonly onDidChangeModel: IEvent<IModelChangedEvent>;
        /**
         * An event emitted when the decorations of the current model have changed.
         * @event
         */
        readonly onDidChangeModelDecorations: IEvent<IModelDecorationsChangedEvent>;
        /**
         * An event emitted when the text inside this editor gained focus (i.e. cursor starts blinking).
         * @event
         */
        readonly onDidFocusEditorText: IEvent<void>;
        /**
         * An event emitted when the text inside this editor lost focus (i.e. cursor stops blinking).
         * @event
         */
        readonly onDidBlurEditorText: IEvent<void>;
        /**
         * An event emitted when the text inside this editor or an editor widget gained focus.
         * @event
         */
        readonly onDidFocusEditorWidget: IEvent<void>;
        /**
         * An event emitted when the text inside this editor or an editor widget lost focus.
         * @event
         */
        readonly onDidBlurEditorWidget: IEvent<void>;
        /**
         * An event emitted after composition has started.
         */
        readonly onDidCompositionStart: IEvent<void>;
        /**
         * An event emitted after composition has ended.
         */
        readonly onDidCompositionEnd: IEvent<void>;
        /**
         * An event emitted when editing failed because the editor is read-only.
         * @event
         */
        readonly onDidAttemptReadOnlyEdit: IEvent<void>;
        /**
         * An event emitted when users paste text in the editor.
         * @event
         */
        readonly onDidPaste: IEvent<IPasteEvent>;
        /**
         * An event emitted on a "mouseup".
         * @event
         */
        readonly onMouseUp: IEvent<IEditorMouseEvent>;
        /**
         * An event emitted on a "mousedown".
         * @event
         */
        readonly onMouseDown: IEvent<IEditorMouseEvent>;
        /**
         * An event emitted on a "contextmenu".
         * @event
         */
        readonly onContextMenu: IEvent<IEditorMouseEvent>;
        /**
         * An event emitted on a "mousemove".
         * @event
         */
        readonly onMouseMove: IEvent<IEditorMouseEvent>;
        /**
         * An event emitted on a "mouseleave".
         * @event
         */
        readonly onMouseLeave: IEvent<IPartialEditorMouseEvent>;
        /**
         * An event emitted on a "keyup".
         * @event
         */
        readonly onKeyUp: IEvent<IKeyboardEvent>;
        /**
         * An event emitted on a "keydown".
         * @event
         */
        readonly onKeyDown: IEvent<IKeyboardEvent>;
        /**
         * An event emitted when the layout of the editor has changed.
         * @event
         */
        readonly onDidLayoutChange: IEvent<EditorLayoutInfo>;
        /**
         * An event emitted when the content width or content height in the editor has changed.
         * @event
         */
        readonly onDidContentSizeChange: IEvent<IContentSizeChangedEvent>;
        /**
         * An event emitted when the scroll in the editor has changed.
         * @event
         */
        readonly onDidScrollChange: IEvent<IScrollEvent>;
        /**
         * An event emitted when hidden areas change in the editor (e.g. due to folding).
         * @event
         */
        readonly onDidChangeHiddenAreas: IEvent<void>;
        /**
         * Saves current view state of the editor in a serializable object.
         */
        saveViewState(): ICodeEditorViewState | null;
        /**
         * Restores the view state of the editor from a serializable object generated by `saveViewState`.
         */
        restoreViewState(state: ICodeEditorViewState): void;
        /**
         * Returns true if the text inside this editor or an editor widget has focus.
         */
        hasWidgetFocus(): boolean;
        /**
         * Get a contribution of this editor.
         * @id Unique identifier of the contribution.
         * @return The contribution or null if contribution not found.
         */
        getContribution<T extends IEditorContribution>(id: string): T | null;
        /**
         * Type the getModel() of IEditor.
         */
        getModel(): ITextModel | null;
        /**
         * Sets the current model attached to this editor.
         * If the previous model was created by the editor via the value key in the options
         * literal object, it will be destroyed. Otherwise, if the previous model was set
         * via setModel, or the model key in the options literal object, the previous model
         * will not be destroyed.
         * It is safe to call setModel(null) to simply detach the current model from the editor.
         */
        setModel(model: ITextModel | null): void;
        /**
         * Gets all the editor computed options.
         */
        getOptions(): IComputedEditorOptions;
        /**
         * Gets a specific editor option.
         */
        getOption<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
        /**
         * Returns the editor's configuration (without any validation or defaults).
         */
        getRawOptions(): IEditorOptions;
        /**
         * Get value of the current model attached to this editor.
         * @see {@link ITextModel.getValue}
         */
        getValue(options?: {
            preserveBOM: boolean;
            lineEnding: string;
        }): string;
        /**
         * Set the value of the current model attached to this editor.
         * @see {@link ITextModel.setValue}
         */
        setValue(newValue: string): void;
        /**
         * Get the width of the editor's content.
         * This is information that is "erased" when computing `scrollWidth = Math.max(contentWidth, width)`
         */
        getContentWidth(): number;
        /**
         * Get the scrollWidth of the editor's viewport.
         */
        getScrollWidth(): number;
        /**
         * Get the scrollLeft of the editor's viewport.
         */
        getScrollLeft(): number;
        /**
         * Get the height of the editor's content.
         * This is information that is "erased" when computing `scrollHeight = Math.max(contentHeight, height)`
         */
        getContentHeight(): number;
        /**
         * Get the scrollHeight of the editor's viewport.
         */
        getScrollHeight(): number;
        /**
         * Get the scrollTop of the editor's viewport.
         */
        getScrollTop(): number;
        /**
         * Change the scrollLeft of the editor's viewport.
         */
        setScrollLeft(newScrollLeft: number, scrollType?: ScrollType): void;
        /**
         * Change the scrollTop of the editor's viewport.
         */
        setScrollTop(newScrollTop: number, scrollType?: ScrollType): void;
        /**
         * Change the scroll position of the editor's viewport.
         */
        setScrollPosition(position: INewScrollPosition, scrollType?: ScrollType): void;
        /**
         * Get an action that is a contribution to this editor.
         * @id Unique identifier of the contribution.
         * @return The action or null if action not found.
         */
        getAction(id: string): IEditorAction;
        /**
         * Execute a command on the editor.
         * The edits will land on the undo-redo stack, but no "undo stop" will be pushed.
         * @param source The source of the call.
         * @param command The command to execute
         */
        executeCommand(source: string | null | undefined, command: ICommand): void;
        /**
         * Create an "undo stop" in the undo-redo stack.
         */
        pushUndoStop(): boolean;
        /**
         * Remove the "undo stop" in the undo-redo stack.
         */
        popUndoStop(): boolean;
        /**
         * Execute edits on the editor.
         * The edits will land on the undo-redo stack, but no "undo stop" will be pushed.
         * @param source The source of the call.
         * @param edits The edits to execute.
         * @param endCursorState Cursor state after the edits were applied.
         */
        executeEdits(source: string | null | undefined, edits: IIdentifiedSingleEditOperation[], endCursorState?: ICursorStateComputer | Selection[]): boolean;
        /**
         * Execute multiple (concomitant) commands on the editor.
         * @param source The source of the call.
         * @param command The commands to execute
         */
        executeCommands(source: string | null | undefined, commands: (ICommand | null)[]): void;
        /**
         * Get all the decorations on a line (filtering out decorations from other editors).
         */
        getLineDecorations(lineNumber: number): IModelDecoration[] | null;
        /**
         * Get all the decorations for a range (filtering out decorations from other editors).
         */
        getDecorationsInRange(range: Range): IModelDecoration[] | null;
        /**
         * All decorations added through this call will get the ownerId of this editor.
         * @see {@link ITextModel.deltaDecorations}
         */
        deltaDecorations(oldDecorations: string[], newDecorations: IModelDeltaDecoration[]): string[];
        /**
         * Get the layout info for the editor.
         */
        getLayoutInfo(): EditorLayoutInfo;
        /**
         * Returns the ranges that are currently visible.
         * Does not account for horizontal scrolling.
         */
        getVisibleRanges(): Range[];
        /**
         * Get the vertical position (top offset) for the line w.r.t. to the first line.
         */
        getTopForLineNumber(lineNumber: number): number;
        /**
         * Get the vertical position (top offset) for the position w.r.t. to the first line.
         */
        getTopForPosition(lineNumber: number, column: number): number;
        /**
         * Returns the editor's container dom node
         */
        getContainerDomNode(): HTMLElement;
        /**
         * Returns the editor's dom node
         */
        getDomNode(): HTMLElement | null;
        /**
         * Add a content widget. Widgets must have unique ids, otherwise they will be overwritten.
         */
        addContentWidget(widget: IContentWidget): void;
        /**
         * Layout/Reposition a content widget. This is a ping to the editor to call widget.getPosition()
         * and update appropriately.
         */
        layoutContentWidget(widget: IContentWidget): void;
        /**
         * Remove a content widget.
         */
        removeContentWidget(widget: IContentWidget): void;
        /**
         * Add an overlay widget. Widgets must have unique ids, otherwise they will be overwritten.
         */
        addOverlayWidget(widget: IOverlayWidget): void;
        /**
         * Layout/Reposition an overlay widget. This is a ping to the editor to call widget.getPosition()
         * and update appropriately.
         */
        layoutOverlayWidget(widget: IOverlayWidget): void;
        /**
         * Remove an overlay widget.
         */
        removeOverlayWidget(widget: IOverlayWidget): void;
        /**
         * Change the view zones. View zones are lost when a new model is attached to the editor.
         */
        changeViewZones(callback: (accessor: IViewZoneChangeAccessor) => void): void;
        /**
         * Get the horizontal position (left offset) for the column w.r.t to the beginning of the line.
         * This method works only if the line `lineNumber` is currently rendered (in the editor's viewport).
         * Use this method with caution.
         */
        getOffsetForColumn(lineNumber: number, column: number): number;
        /**
         * Force an editor render now.
         */
        render(forceRedraw?: boolean): void;
        /**
         * Get the hit test target at coordinates `clientX` and `clientY`.
         * The coordinates are relative to the top-left of the viewport.
         *
         * @returns Hit test target or null if the coordinates fall outside the editor or the editor has no model.
         */
        getTargetAtClientPoint(clientX: number, clientY: number): IMouseTarget | null;
        /**
         * Get the visible position for `position`.
         * The result position takes scrolling into account and is relative to the top left corner of the editor.
         * Explanation 1: the results of this method will change for the same `position` if the user scrolls the editor.
         * Explanation 2: the results of this method will not change if the container of the editor gets repositioned.
         * Warning: the results of this method are inaccurate for positions that are outside the current editor viewport.
         */
        getScrolledVisiblePosition(position: IPosition): {
            top: number;
            left: number;
            height: number;
        } | null;
        /**
         * Apply the same font settings as the editor to `target`.
         */
        applyFontInfo(target: HTMLElement): void;
        setBanner(bannerDomNode: HTMLElement | null, height: number): void;
    }

```

ということで

講義と同様、editor は getModel()を持つ

#### 128~129: フォーマッティング機能の実装

```bash
$ npm i prettier @types/prettier
```

prettier をコード内で利用するには適切なパーサを用意しなくてはならない

```JavaScript
import prettier from 'prettier';
import parser from 'prettier/parser-babel';
```

ボタンを押したらフォーマットする機能にする

なので onClick ハンドラ内部で

-   エディタ内のコードを取得する
-   コードをフォーマットする
-   フォーマットしたコードをエディタに戻す

を実行しなくてはならない

すでに useRef で editor を参照しているので

-   `editorRef.current.getModel().getValue()`でコードを取得して
-   `prettier.format()`でフォーマット内容を定義して
-   `editorRef.current.getValue()`で加工したコードを返す

```TypeScript
// code-editor.tsx

    const onFormatClick = (): void => {
        if (!editorRef.current) return;
        const unformatted = editorRef.current.getModel().getValue();
        const formatted = prettier.format(unformatted, {
            parser: 'babel',
            plugins: [parser],
            useTabs: false,
            semi: true,
            singleQuote: true,
        });
        editorRef.current.setValue(formatted);
    };
```

#### 130: Adding a CSS Library

```bash
$ npm i bulmaswatch
```

```JavaScript
// index.tsx
import 'bulmaswatch/superhero/bulmaswatch.min.css';
```

あとはスタイリングを適用したいタグに className を指定するだけ

#### 132: 構文の強調表示の修正

NOTE: この回はオプションである！！コードもなんだか変になるし、無視してもいいよ

だからバージョン違いの話は回避できるよ

まじめにやるとバージョン違いの問題からまったく動かなくなるよ

React 構文のハイライト設定

```bash
$ npm i --save-exact monaco-jsx-highlighter@0.0.15 jscodeshift@0.11.0 @types/jscodeshift@0.7.2
```

-   jscodeshift

> 渡された各ファイルに対して提供された transform を実行するランナーです。また、変換された（されていない）ファイルの数をまとめて出力する。
> recast のラッパーで、異なる API を提供する。Recast は AST から AST への変換ツールであり、元のコードのスタイルを可能な限り維持しようとするものでもある。

-   monaco-jsx-highligher

monaco editor 上の JSX 構文をハイライトするライブラリを提供する
babel を使っています


```TypeScript
import './code-editor.css';
import { useRef } from 'react';
import MonacoEditor, { EditorDidMount } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';

// ハイライトモジュール
// monaco-jsx-highlighterはdeclareする必要がある
import codeShift from 'jscodeshift';
import Highlighter from 'monaco-jsx-highlighter';

interface CodeEditorProps {
    initialValue: string;
    onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, initialValue }) => {
    const editorRef = useRef<any>();

    const onEditorDidMount: EditorDidMount = (getValue, monacoEditor) => {
        editorRef.current = monacoEditor;
        monacoEditor.onDidChangeModelContent(() => {
            onChange(getValue());
        });

        monacoEditor.getModel()?.updateOptions({ tabSize: 2 });

        // NOTE: monacoを認識できないから（実行時に任せる）
        const highlighter = new Highlighter(
            // @ts-ignore
            window.monaco,
            codeShift,
            monacoEditor
        );

        // エディタ上で1文字入力するたびにハイライタが動作するので
        // それを抑えるためにコールバックを渡している
        highlighter.highLightOnDidChangeModelContent(
            () => {},
            () => {},
            undefined,
            () => {}
        );
    };

    const onFormatClick = () => {
        // get current value from editor
        const unformatted = editorRef.current.getModel().getValue();

        // format that value
        const formatted = prettier
            .format(unformatted, {
                parser: 'babel',
                plugins: [parser],
                useTabs: false,
                semi: true,
                singleQuote: true,
            })
            .replace(/\n$/, '');

        // set the formatted value back in the editor
        editorRef.current.setValue(formatted);
    };

    return (
        <div className="editor-wrapper">
            <button
                className="button button-format is-primary is-small"
                onClick={onFormatClick}
            >
                Format
            </button>
            <MonacoEditor
                editorDidMount={onEditorDidMount}
                value={initialValue}
                theme="dark"
                language="javascript"
                height="500px"
                options={{
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    showUnused: false,
                    folding: false,
                    lineNumbersMinChars: 3,
                    fontSize: 16,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
```

これでeditor上のReactのJSXがハイライトされるようになった
