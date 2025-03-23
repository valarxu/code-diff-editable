# code-diff-editable

一个React组件，用于比较和编辑代码差异。支持行级比较、实时编辑和差异行复制功能。

## 安装

```bash
npm install code-diff-editable
```

或者

```bash
yarn add code-diff-editable
```

## 使用方法

```jsx
import React, { useRef } from 'react';
import DiffEditor from 'code-diff-editable';

const CodeComparisonEditor = () => {
  const diffEditorRef = useRef();
  
  // 获取编辑后的内容
  const handleSave = () => {
    const leftContent = diffEditorRef.current.getLeftContent();
    const rightContent = diffEditorRef.current.getRightContent();
    console.log('左侧内容：', leftContent);
    console.log('右侧内容：', rightContent);
  };
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <DiffEditor
        ref={diffEditorRef}
        leftText="function example() {\n  console.log('原始代码');\n}"
        rightText="function example() {\n  console.log('修改后的代码');\n}"
        leftTitle="原始版本"
        rightTitle="修改版本"
      />
      <button onClick={handleSave}>保存更改</button>
    </div>
  );
};

export default CodeComparisonEditor;
```

## 特性

- 代码差异高亮显示
- 可编辑的代码文本区域
- 行级差异比较
- 行号显示
- 差异行的双向复制功能
- 同步滚动

## 属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| leftText | string | 必填 | 左侧编辑器的初始文本 |
| rightText | string | 必填 | 右侧编辑器的初始文本 |
| leftTitle | string | '左侧' | 左侧编辑器的标题 |
| rightTitle | string | '右侧' | 右侧编辑器的标题 |

## 方法

通过 `ref` 可以访问组件的以下方法：

- `getLeftContent()`: 获取左侧编辑器当前内容
- `getRightContent()`: 获取右侧编辑器当前内容

## 许可证

MIT 