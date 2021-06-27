import { Node as ProsemirrorNode } from 'prosemirror-model';
import React, { useMemo, useState } from 'react';
import {
  Editor,
} from '~/packages/react/collabee-editor';
import {
  createHTMLTransformer,
  createJSONTransformer,
  createNullTransformer,
} from '~/packages/converters';
import schema from '~/packages/schema';

const htmlTransformer = createHTMLTransformer(schema);
const jsonTransformer = createJSONTransformer(schema);
const nullTransformer = createNullTransformer();

const initialValue = `<p></p>`;
const initialDoc = htmlTransformer.parse(initialValue);

// const floatingTools = toolbar.slice(0, 2);
// const fixedTools = toolbar.slice(2);

// TODO: nodeviews, perhaps displaying a node type switcher alongside each node?

export const App: React.FC = () => {
  const [doc, setDoc] = useState<ProsemirrorNode>(initialDoc);

  const [html, setHTML] = useState<string>(initialValue);

  return (
    <div>
      <div className='prosemirror-demo'>
        <div className='prosemirror-demo-editor'>
          <CollabeeEditor
            schema={schema}
            plugins={plugins}
            value={initialValue}
            handleChange={setHTML}
            debounce={1000}
          >
            <Toolbar toolbar={toolbar} />
            <Editor autoFocus />
          </CollabeeEditor>
        </div>
        <div className='prosemirror-demo-output'>
          <pre>{html}</pre>
        </div>
      </div>

      <div className='prosemirror-demo'>
        <div className='prosemirror-demo-editor'>
          <EditorProvider plugins={plugins} doc={initialDoc}>
            <ChangeHandler
              handleChange={setDoc}
              transformer={nullTransformer}
            />
            <Toolbar toolbar={fixedTools} />
            <Floater>
              <Toolbar toolbar={floatingTools} />
            </Floater>
            <Editor autoFocus />
          </EditorProvider>
        </div>
        {doc !== undefined && (
          <div className='prosemirror-demo-output'>
            <JSONOutput doc={doc} />
            <HTMLOutput doc={doc} />
          </div>
        )}
      </div>
    </div>
  );
};

const JSONOutput: React.FC<{ doc: ProsemirrorNode }> = ({ doc }) => {
  const debouncedDoc = useDebounce(doc, 1000);

  const json = useMemo(() => jsonTransformer.serialize(debouncedDoc), [
    debouncedDoc,
  ]);

  return (
    <div className='output'>
      <pre>{json}</pre>
    </div>
  );
};

const HTMLOutput: React.FC<{ doc: ProsemirrorNode }> = ({ doc }) => {
  const [html, setHTML] = useState('');

  // serialize when the button is clicked
  const handleClick = () => {
    setHTML(htmlTransformer.serialize(doc));
  };

  return (
    <div className='output'>
      <button type='button' onClick={handleClick}>
        Show HTML
      </button>
      <pre>{html}</pre>
    </div>
  );
};
