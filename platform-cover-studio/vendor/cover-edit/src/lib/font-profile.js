export const FONT_STACKS = {
  editorialSerifCn: [
    '"Noto Serif CJK SC"',
    '"Source Han Serif SC"',
    '"Songti SC"',
    '"Songti TC"',
    'serif'
  ],
  editorialSansCn: [
    '"Noto Sans CJK SC"',
    '"Source Han Sans SC"',
    '"PingFang SC"',
    '"Hiragino Sans GB"',
    '"Microsoft YaHei"',
    'system-ui',
    'sans-serif'
  ],
  uiSans: [
    'Inter',
    '"Noto Sans"',
    'system-ui',
    'sans-serif'
  ]
};

export function fontStack(name) {
  const stack = FONT_STACKS[name] || FONT_STACKS.editorialSansCn;
  return stack.join(', ');
}
