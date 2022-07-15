# Error Handling

Section 14

エディタ内で`setTimeout`を追加し、そのコールバックでエラーを起こさせても、

プレビューにはエラーが表示できないという問題が残っている

また、有効でない JavaScript コードを入力されるとエラーが表示されないまま。

#### 164 Extracting Reusable Error Handling Logic

非同期ランタイムエラーをキャッチできるようにしてみよう

準備としてエラーハンドリング路軸を関数に抽出する

```TypeScript
// preview.tsx

const html = `
<html>
 <head>
   <style>body{background-color: fff;}</style>
 </head>
 <body>
   <div id="root"></div>
   <script>
   const errorHandler = (err) => {
     const root = document.querySelector('#root');
     root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
     console.error(err);
   }
     window.addEventListener('message', (event) => {
       try {
         eval(event.data);
       } catch (err) {
         errorHandler(err);
       }
     }, false);
   </script>
 </body>
</html>
`;

```

window に error イベントのリスナをつける

```TypeScript
// preview.tsx

const html = `
<html>
 <head>
   <style>body{background-color: fff;}</style>
 </head>
 <body>
   <div id="root"></div>
   <script>
   const errorHandler = (err) => {
     const root = document.querySelector('#root');
     root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>';
     console.error(err);
   }

   window.addEventListener('error', (event) => {
       console.log('Asynchronous Error');
     console.log(event);
   })
     window.addEventListener('message', (event) => {
       try {
         eval(event.data);
       } catch (err) {
           console.log("Synchronous Error");
         errorHandler(err);
       }
     }, false);
   </script>
 </body>
</html>
`;

```

try..catch と error イベントリスナは競合しないのか？

これは同期的なエラーは catch が、

非同期なエラーは error イベントリスナがキャッチしてくれるので

区別できる。

どうして区別できるのかわかっていない。

調べること。
