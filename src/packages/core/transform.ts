import { Node } from 'prosemirror-model';
import { Step, ReplaceStep } from 'prosemirror-transform';
import { assign, get } from 'lodash';
import schema from './schema';
import { uniqueNodeId } from '../lib/unique-id';
import { Transaction } from 'prosemirror-state';

function isReplaceStep(step: Step) {
  return step instanceof ReplaceStep;
}

type JSONItem = {
  [name: string]: string;
};

type JSONRepForNode = {
  type: string;
  attrs: JSONItem;
};

export function ensureTopNodesHaveId(documentNode: Node) {
  const json = documentNode.toJSON();
  if (!json) return documentNode;

  const transformed = {
    ...json,
    content: json.content.map((node: JSONRepForNode) => {
      const attrs = { ...(node.attrs || {}) };
      if (!attrs.id) {
        attrs.id = uniqueNodeId();
      }

      return { ...node, attrs };
    }),
  };

  return Node.fromJSON(schema, transformed);
}

/**
 * 트랜잭션 자체를 변형하여 새로운 블럭 노드는 무조건 아이디를 가지도록 수정한다.
 * @param {Transaction} tr 트랜잭션
 */
export function giveIdToBlockNodes(tr: Transaction) {
  if (!tr.docChanged) {
    const { $head } = tr.selection;
    const node = $head.node(1);
    if (node && !node.attrs.id) {
      tr = tr.setNodeMarkup($head.before(1), undefined, {
        ...node.attrs,
        id: uniqueNodeId(),
      });
    }
    return tr;
  }

  const isPasted = get(tr, 'meta.pasted') === true;
  const schema = tr.doc.type.schema;

  tr.steps = tr.steps.map((step) => {
    if (!isReplaceStep(step)) return step;

    const json = step.toJSON();
    const content = get(json, 'slice.content', []);

    if (content.length < 2) return step;

    const prevIds: string[] = [];
    json.slice.content = content.map((node: JSONRepForNode) => {
      if (!schema.nodes[node.type].isBlock) return node;
      if (isPasted || !node.attrs?.id || prevIds.indexOf(node.attrs?.id) !== -1) {
        node.attrs = { ...node.attrs, id: uniqueNodeId() };
      }
      prevIds.push(node.attrs.id);

      return assign({}, node);
    });

    return ReplaceStep.fromJSON(schema, json);
  });

  tr.steps.forEach((step, index) => {
    const newDoc = step.apply(tr.docs[index]).doc as Node;
    if (index === tr.steps.length - 1) {
      tr.doc = newDoc;
    } else {
      tr.docs[index + 1] = newDoc;
    }
  });

  tr.doc.forEach((node, offset) => {
    if (!node.attrs.id) {
      tr = tr.setNodeMarkup(offset, undefined, { ...node.attrs, id: uniqueNodeId() });
    }
  });

  return tr;
}

export function applyJSONSteps(source: Node | JSONItem, steps?: JSONItem[]): Node {
  try {
    if (!(source instanceof Node)) {
      source = Node.fromJSON(schema, source);
    }
  } catch (e) {
    throw `Invalid source: ${JSON.stringify(source)}`;
  }

  return (steps || []).reduce((_doc, step) => {
    const result = Step.fromJSON(schema, step).apply(_doc);
    return result.doc || _doc;
  }, source);
}

/**
 * 최상위 노드에서 중복되는 아이디가 존재하지 않도록 트랜잭션을 변형한다.
 * @param {Transaction} tr
 */
export function removeDuplicatedId(tr: Transaction): Transaction {
  const usedId: { [id: string]: boolean } = {};
  const nodes: { node: Node; offset: number; index: number }[] = [];

  tr.doc.forEach((node, offset, index) => {
    const id = node.attrs.id;
    if (!id) return;
    if (usedId[id]) {
      nodes.push({ node, offset, index });
    } else {
      usedId[id] = true;
    }
  });

  return nodes.reduce(
    (_tr, { node, offset }) =>
      _tr.setNodeMarkup(offset, undefined, { ...node.attrs, id: uniqueNodeId() }),
    tr
  );
}
