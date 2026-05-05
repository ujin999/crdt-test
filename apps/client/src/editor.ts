import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'

import { defaultKeymap } from '@codemirror/commands'
import { history, historyKeymap } from '@codemirror/commands'

import { yCollab } from 'y-codemirror.next'
import { doc } from './crdt'

const yText = doc.getText('codemirror')

export function createEditor(parent: HTMLElement) {
  return new EditorView({
    state: EditorState.create({
      doc: '',
      extensions: [
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap
        ]),
        history(),
        yCollab(yText, null as any)
      ]
    }),
    parent
  })
}