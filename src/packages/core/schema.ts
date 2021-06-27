import { Node, Mark, Schema, SchemaSpec, NodeSpec, MarkSpec, ParseRule, AttributeSpec } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { tableNodes } from 'prosemirror-tables';
import { assign, chunk, omit, range, uniq, isPlainObject } from 'lodash';

let { nodes, marks }: any = basicSchema.spec;

/**
 * Nodes
 */

// blockquotes
nodes = nodes.update('blockquote', {
  ...nodes.get('blockquote'),
  content: '( paragraph | heading )+',
});

// language for code_block
nodes = nodes.update('code_block', {
  ...nodes.get('code_block'),
  attrs: { lang: { default: null } },
  parseDOM: [
    {
      tag: 'pre',
      preserveWhitespace: 'full',
      getAttrs: (dom: HTMLParagraphElement) => ({ lang: dom.getAttribute('data-lang') }),
    },
  ],
  toDOM({ attrs }: Node) {
    return [
      'pre',
      { class: attrs.lang && `lang-${attrs.lang}`, 'data-lang': attrs.lang },
      ['code', 0],
    ];
  },
});

// image
nodes = nodes.update('image', {
  ...nodes.get('image'),
  group: 'block',
  inline: false,
  toDOM({ attrs }: Node) {
    return ['img', { ...attrs, class: 'external-image' }];
  },
});

// add list nodes
nodes = addListNodes(nodes, 'paragraph block*', 'block');
nodes = nodes.update('ordered_list', {
  ...nodes.get('ordered_list'),
  toDOM() {
    return ['ol', { role: 'presentation' }, 0];
  },
});
nodes = nodes.update('bullet_list', {
  ...nodes.get('bullet_list'),
  toDOM() {
    return ['ul', { role: 'presentation' }, 0];
  },
});
nodes = nodes.update('list_item', {
  ...nodes.get('list_item'),
  attrs: { level: { default: 1 }, reset: { default: null } },
  toDOM({ attrs: { level } }: Node) {
    return ['li', { role: 'listitem', 'aria-level': level, 'data-level': level }, 0];
  },
});

// add table nodes
nodes = nodes.append(
  tableNodes({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes: {
      background: {
        default: null,
        getFromDOM(dom: any) {
          return dom.style.backgroundColor || null;
        },
        setDOMAttr(value, attrs) {
          if (value) {
            attrs.style = (attrs.style || '') + `background-color: ${value}`;
          }
        },
      },
    },
  })
);

nodes = nodes.update('table_row', {
  ...nodes.get('table_row'),
  attrs: { height: { default: 0 } },
  parseDOM: [
    {
      tag: 'tr',
      getAttrs: (dom: HTMLTableRowElement) => (dom.style.height ? parseInt(dom.style.height) : 0),
    },
  ],
  toDOM: ({ attrs }: Node) => ['tr', attrs.height ? { style: `height: ${attrs.height}px` } : {}, 0],
});

// new schema
nodes = nodes.append({
  indent: {
    attrs: { id: { default: null }, level: { default: 1 } },
    group: 'top_node',
    content: '(paragraph | heading | blockquote | table )+',
    inline: false,
    parseDOM: range(1, 12).map((level) => ({
      tag: `div.indent-${level}`,
      attrs: { level },
    })),
    toDOM({ attrs }: Node) {
      return ['div', { class: `indent indent-${attrs.level}` }, 0];
    },
  },
  hashtag: {
    attrs: { editable: { default: false } },
    group: 'inline',
    content: 'text*',
    marks: '',
    atom: true,
    inline: true,
    selectable: false,
    draggable: true,
    isolating: true,
    parseDOM: [{ tag: 'span.hashtag' }],
    toDOM() {
      return ['span', { class: 'hashtag' }, 0];
    },
  },
  mention: {
    attrs: { editable: { default: false }, uid: { default: null } },
    group: 'inline',
    content: 'text*',
    marks: '',
    atom: true,
    selectable: false,
    draggable: true,
    inline: true,
    parseDOM: [
      {
        tag: 'span.mention',
        getAttrs(dom: HTMLSpanElement) {
          return {
            uid: dom.getAttribute('data-uid'),
          };
        },
      },
    ],
    toDOM({ attrs }: Node) {
      return ['span', { class: 'mention', 'data-uid': attrs.uid }, 0];
    },
  },
  widget_marker: {
    attrs: {
      type: { default: null },
      author: { default: null },
      createdAt: { default: null },
      args: { default: null },
    },
    group: 'top_node block',
    inline: false,
    draggable: true,
    selectable: true,
    parseDOM: [
      {
        tag: 'figure.widget-marker',
        getAttrs: (dom: HTMLElement) => ({
          type: dom.getAttribute('data-type'),
          author: dom.getAttribute('data-author'),
          createdAt: dom.getAttribute('date-created-at'),
          args: JSON.parse(dom.getAttribute('data-args') || 'null'),
        }),
      },
    ],
    toDOM({ attrs }: Node) {
      return [
        'figure',
        {
          class: 'widget-marker',
          'data-type': attrs.type,
          'data-author': attrs.author,
          'data-created-at': attrs.createdAt,
          'data-args': JSON.stringify(attrs.args),
        },
      ];
    },
  },
});

nodes = nodes.update('doc', {
  content: '(block | top_node)+',
});

/**
 * Marks
 */

marks = marks.append({
  forecolor: {
    attrs: { color: { default: null } },
    parseDOM: [
      {
        tag: 'font[color]',
        getAttrs: (dom: HTMLElement) => ({ color: dom.getAttribute('color') }),
      },
      {
        style: 'color',
        getAttrs: (color: string) => ({ color }),
      },
    ],
    toDOM({ attrs }: Node) {
      return ['span', { style: `color: ${attrs.color}` }, 0];
    },
  },
  bgcolor: {
    attrs: { color: { default: null } },
    parseDOM: [
      {
        style: 'background-color',
        getAttrs: (color: string) => ({ color }),
      },
    ],
    toDOM({ attrs }: Node) {
      return ['span', /*{ style: `background-color: ${attrs.color}` },*/ 0];
    },
  },
  del: {
    group: 'decoration',
    parseDOM: [{ tag: 'del' }, { tag: 'strike' }, { style: 'text-decoration=line-through' }],
    toDOM() {
      return ['span', { style: 'text-decoration: line-through;' }, 0];
    },
  },
  underline: {
    group: 'decoration',
    parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
    toDOM() {
      return ['span', { style: 'text-decoration: underline;' }, 0];
    },
  },
});

nodes = chunk(nodes.content, 2).reduce((_nodes: NodeSpec, [name, spec]: any) => {
  if (name === 'paragraph' || name === 'heading') {
    spec = addAlignAttr(spec);
  }
  if (/\b(?:top_node|block)\b/.test(spec.group)) {
    spec = addIdAttr(spec);
  }
  return _nodes.update(name, spec);
}, nodes);

const schema = new Schema({ nodes, marks });

export default schema;

function addParseRule(rules: ParseRule[], modifier: (dom: HTMLElement) => void) {
  return rules.map((rule) => {
    return assign(omit(rule, ['attrs', 'getAttrs']), {
      getAttrs: (dom: HTMLElement) =>
        assign(
          {},
          rule.attrs || {},
          rule.getAttrs ? rule.getAttrs(dom) || {} : {},
          modifier(dom)
        ),
    });
  });
}

function addOutputAttr(spec: any, modifier: any) {
  return (node: NodeSpec) => {
    const output = spec.toDOM(node);

    // 항상 DOM 속성 객체를 추가
    if (!isPlainObject(output[1])) {
      output.splice(1, 0, {});
    }

    // DOM 속성 수정
    output[1] = modifier(node, output[1]);

    return output;
  };
}

function addAlignAttr(spec: any) {
  const pattern = /\balign(left|right|center)\b/;

  return assign(
    {},
    spec,
    // add align attribute
    {
      attrs: assign({ align: { default: null } }, spec.attrs),
      parseDOM: addParseRule(spec.parseDOM, (dom) => {
        const match = pattern.exec(dom.className);
        return match ? { align: match[1] } : null;
      }),
      toDOM: addOutputAttr(spec, (node: Node, domAttrs: any) => {
        const classes = (domAttrs.class || '')
          .split(/\s+/g)
          .filter((cls: string) => !pattern.test(cls));

        if (node.attrs.align) {
          classes.unshift(`align${node.attrs.align}`);
        }

        domAttrs.class = uniq(classes).join(' ').trim();

        return domAttrs;
      }),
    }
  );
}

function addIdAttr(spec: any) {
  return assign(
    {},
    spec,
    // add align attribute
    {
      attrs: assign({ id: { default: null } }, spec.attrs),
      parseDOM: addParseRule(spec.parseDOM, (dom) => ({ id: dom.id })),
      toDOM: addOutputAttr(spec, (node: Node, domAttrs: any) => {
        domAttrs.id = node.attrs.id || null;
        return domAttrs;
      }),
    }
  );
}
