import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import styles from './styles.less';

const DiffEditor = forwardRef((props: {leftText: string, rightText: string, leftTitle?: string, rightTitle?: string}, ref) => {
  const { leftText, rightText, leftTitle = '左侧', rightTitle = '右侧' } = props;
  const [leftContent, setLeftContent] = useState('');
  const [rightContent, setRightContent] = useState('');
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [highlighted, setHighlighted] = useState({ left: '', right: '' });
  const [lineCount, setLineCount] = useState({ left: 0, right: 0 });

  // 透出内容方法
  useImperativeHandle(ref, () => ({
    getLeftContent: () => leftContent,
    getRightContent: () => rightContent,
  }));

  // onBlur后变更内容
  const handleOnBlur = (side: string, e: any) => {
    const content = e.target.innerText.replace(/\r\n/g, '\n'); // 统一换行符
    if (side === 'left') {
      setLeftContent(content);
    } else {
      setRightContent(content);
    }
  };

  // 生成行号
  const renderLineNumbers = (side: 'left' | 'right', count: number) => {
    const leftLines = leftContent.split('\n');
    const rightLines = rightContent.split('\n');
    const matches = getLCS(leftLines, rightLines);

    return (
      <div className={styles["line-numbers"]}>
        {Array.from({ length: count }, (_, i) => {
          // 检查该行是否有差异
          let hasDifference = false;
          if (side === 'left') {
            // 检查左侧行是否在任何匹配中
            hasDifference = !rightLines.some((_, j) => matches.has(`${i},${j}`));
          } else {
            // 检查右侧行是否在任何匹配中
            hasDifference = !leftLines.some((_, j) => matches.has(`${j},${i}`));
          }

          return (
            <div key={i + 1} className={styles["line-number-wrapper"]}>
              {side === 'left' && (
                <>
                  <div className={`${styles["line-number"]}`}>{i + 1}</div>
                  {hasDifference && (
                    <div
                      className={styles["arrow-right"]}
                      onClick={() => copyLine('left', i)}
                      title="Copy to right"
                    >
                      →
                    </div>
                  )}
                </>
              )}
              {side === 'right' && (
                <>
                  {hasDifference && (
                    <div
                      className={styles["arrow-left"]}
                      onClick={() => copyLine('right', i)}
                      title="Copy to left"
                    >
                      ←
                    </div>
                  )}
                  <div className={`${styles["line-number"]}`}>{i + 1}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 计算两个字符串的最长公共子序列（LCS）
  const getLCS = (str1: string[], str2: string[]) => {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    // 构建 DP 表
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // 回溯找出匹配的行
    const matches = new Set();
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (str1[i - 1] === str2[j - 1]) {
        matches.add(`${i - 1},${j - 1}`);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return matches;
  };

  // 生成高亮内容
  const getHighlightedContent = (left: string, right: string) => {
    const leftLines = left.split('\n');
    const rightLines = right.split('\n');
    const matches = getLCS(leftLines, rightLines);

    setLineCount({
      left: leftLines.length,
      right: rightLines.length
    });

    return {
      left: Array.from({ length: leftLines.length }, (_, i) => {
        const line = leftLines[i] || '';
        // 检查该行是否有匹配
        let isMatched = false;
        for (let j = 0; j < rightLines.length; j++) {
          if (matches.has(`${i},${j}`)) {
            isMatched = true;
            break;
          }
        }
        const highlight = !isMatched ? styles['diff-line-left'] : '';
        return `<div class="${styles.line} ${highlight}">${line || ' '}</div>`;
      }).join(''),

      right: Array.from({ length: rightLines.length }, (_, i) => {
        const line = rightLines[i] || '';
        // 检查该行是否有匹配
        let isMatched = false;
        for (let j = 0; j < leftLines.length; j++) {
          if (matches.has(`${j},${i}`)) {
            isMatched = true;
            break;
          }
        }
        const highlight = !isMatched ? styles['diff-line-right'] : '';
        return `<div class="${styles.line} ${highlight}">${line || ' '}</div>`;
      }).join('')
    };
  };

  // 统一换行符
  const uniformBreaks = (text: string) => {
    const content = text.replace(/\r\n/g, '\n');
    return content;
  }

  // 处理按键操作
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // 在光标位置插入换行符
      const selection: any = window.getSelection();
      const range: any = selection.getRangeAt(0);
      const textNode = document.createTextNode('\n');
      range.insertNode(textNode);

      // 移动光标到插入的换行符后
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    if (e.key === 'Tab') {
      e.preventDefault();

      // 获取选区
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      if (range) {
        // 创建一个文本节点，包含制表符（通常是2或4个空格）
        const tabNode = document.createTextNode('    '); // 4个空格

        // 在当前光标位置插入制表符
        range.insertNode(tabNode);

        // 将光标移动到插入的制表符之后
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);

        // 更新选区
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  // 添加复制行内容的处理函数
  const copyLine = (fromSide: 'left' | 'right', lineIndex: number) => {
    const lines = fromSide === 'left'
      ? leftContent.split('\n')
      : rightContent.split('\n');
    const targetLines = fromSide === 'left'
      ? rightContent.split('\n')
      : leftContent.split('\n');

    if (lines[lineIndex]) {
      targetLines[lineIndex] = lines[lineIndex];
      const newContent = targetLines.join('\n');

      if (fromSide === 'left') {
        setRightContent(newContent);
      } else {
        setLeftContent(newContent);
      }
    }
  };

  // 添加新的 refs
  const leftContainerRef = useRef(null);
  const rightContainerRef = useRef(null);
  const arrowsContainerRef = useRef(null);

  // 内容变更变化检测
  useEffect(() => {
    let highlighted = getHighlightedContent(leftContent, rightContent);
    setHighlighted(highlighted);
  }, [leftContent, rightContent]);

  // 入参检测
  useEffect(() => {
    let leftContent = uniformBreaks(leftText);
    let rightContent = uniformBreaks(rightText);
    setLeftContent(leftContent);
    setRightContent(rightContent);
  }, [leftText, rightText])

  // 在组件中添加同步滚动
  useEffect(() => {
    const leftEditor: any = leftRef.current;
    const rightEditor: any = rightRef.current;
    const leftContainer: any = leftContainerRef.current;
    const rightContainer: any = rightContainerRef.current;
    const arrowsContainer: any = arrowsContainerRef.current;

    const handleScroll = (e: any) => {
      const scrollTop = e.target.scrollTop;

      if (e.target === leftEditor) {
        if (rightEditor) rightEditor.scrollTop = scrollTop;
        if (leftContainer) {
          const lineNumbers = leftContainer.querySelector(`.${styles['line-numbers']}`);
          if (lineNumbers) lineNumbers.style.transform = `translateY(-${scrollTop}px)`;
        }
        if (arrowsContainer) {
          const arrows = arrowsContainer.querySelector(`.${styles['arrows-container']}`);
          if (arrows) arrows.style.transform = `translateY(-${scrollTop}px)`;
        }
      } else {
        if (leftEditor) leftEditor.scrollTop = scrollTop;
        if (rightContainer) {
          const lineNumbers = rightContainer.querySelector(`.${styles['line-numbers']}`);
          if (lineNumbers) lineNumbers.style.transform = `translateY(-${scrollTop}px)`;
        }
        if (arrowsContainer) {
          const arrows = arrowsContainer.querySelector(`.${styles['arrows-container']}`);
          if (arrows) arrows.style.transform = `translateY(-${scrollTop}px)`;
        }
      }
    };

    leftEditor?.addEventListener('scroll', handleScroll);
    rightEditor?.addEventListener('scroll', handleScroll);

    return () => {
      leftEditor?.removeEventListener('scroll', handleScroll);
      rightEditor?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles["diff-container"]}>
      <div className={styles["editor-column"]}>
        <div className={styles["editor-header"]}>
          <span className={styles["editor-title"]}>{leftTitle}</span>
        </div>
        <div ref={leftContainerRef} className={styles["scroll-container"]}>
          <div
            ref={leftRef}
            className={styles["editor"]}
            contentEditable
            dangerouslySetInnerHTML={{ __html: highlighted.left }}
            onBlur={(e) => handleOnBlur('left', e)}
            onKeyDown={handleKeyDown}
          />
          <div className={styles["line-numbers-wrapper"]}>
            {renderLineNumbers('left', lineCount.left)}
          </div>
        </div>
      </div>
      <div className={styles["editor-column"]}>
        <div className={styles["editor-header"]}>
          <span className={styles["editor-title"]}>{rightTitle}</span>
        </div>
        <div ref={rightContainerRef} className={styles["scroll-container"]}>
          <div className={styles["line-numbers-wrapper"]}>
            {renderLineNumbers('right', lineCount.right)}
          </div>
          <div
            ref={rightRef}
            className={styles["editor"]}
            contentEditable
            dangerouslySetInnerHTML={{ __html: highlighted.right }}
            onBlur={(e) => handleOnBlur('right', e)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
});

export default DiffEditor;