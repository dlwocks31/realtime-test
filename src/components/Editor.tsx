"use client"; // this registers <Editor> as a Client Component
import {
  Block as BlockOriginal,
  BlockNoteEditor,
  BlockSchema,
  defaultProps,
  defaultBlockSchema,
} from "@blocknote/core";
import {
  BlockNoteView,
  InlineContent,
  createReactBlockSpec,
  useBlockNote,
} from "@blocknote/react";
import "@blocknote/core/style.css";
import * as Y from "yjs";
import { useEffect, useMemo, useState } from "react";
import YPartyKitProvider from "y-partykit/provider";

export type MyBlockSchema = BlockSchema & {
  emoji: {
    propSchema: {
      emoji: {
        default: "👍";
      };
      backgroundColor: {
        default: "transparent";
      };
      textColor: {
        default: "black";
      };
      textAlignment: {
        default: "left";
        values: readonly ["left", "center", "right", "justify"];
      };
    };
  };
};

type Block = BlockOriginal<MyBlockSchema>;

// Ref: https://github.com/TypeCellOS/BlockNote/blob/0ff6ed993eec400b3df720af95df26786770a3ea/packages/website/docs/.vitepress/theme/components/Examples/BlockNote/ReactBlockNote.tsx#L59
// Our <Editor> component that we can now use
const Editor = ({
  onEditorReady,
  setTextCursorBlockId,
}: {
  selectedEmoji: string;
  onEditorReady?: (editor: BlockNoteEditor<MyBlockSchema> | null) => void;
  setTextCursorBlockId: (blockId: string | null) => void;
}) => {
  const [doc, provider] = useMemo(() => {
    console.log("create");
    const doc = new Y.Doc();
    const provider = new YPartyKitProvider(
      "blocknote-dev.yousefed.partykit.dev",
      // use a unique name as a "room" for your application:
      "jaechan-lee-project",
      doc
    );
    return [doc, provider];
  }, []);

  const EmojiBlock = createReactBlockSpec({
    type: "emoji",
    propSchema: {
      ...defaultProps,
      emoji: {
        default: "👍" as const,
      },
    },
    containsInlineContent: false,
    render: ({ block }) => (
      <div
        className="relative "
        onClick={() =>
          alert(`Emoji ${block.props.emoji} at block ${block.id} is clicked`)
        }
      >
        <div className="absolute -left-16 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-500">
          {block.props.emoji}
        </div>
        <InlineContent />
      </div>
    ),
  });
  InlineContent;

  // Creates a new editor instance.
  const editor: BlockNoteEditor<MyBlockSchema> | null = useBlockNote({
    collaboration: {
      provider,
      // Where to store BlockNote data in the Y.Doc:
      fragment: doc.getXmlFragment("document-store"),
      // Information (name and color) for this user:
      user: {
        name: "My Username",
        color: "#ff0000",
      },
    },
    blockSchema: {
      // Adds all default blocks.
      ...defaultBlockSchema,
      // Adds the custom image block.
      emoji: EmojiBlock,
    },
    onTextCursorPositionChange: (editor: BlockNoteEditor<MyBlockSchema>) => {
      const hoveredBlock: Block = editor.getTextCursorPosition().block;
      console.log("textCursorPosition", editor.getTextCursorPosition());
      setTextCursorBlockId(hoveredBlock.id);
      console.log("onTextCursorPositionChange", hoveredBlock);
      editor.forEachBlock((block: Block) => {
        if (
          block.id === hoveredBlock.id &&
          block.props.backgroundColor !== "blue"
        ) {
          // If the block is currently hovered by the text cursor, makes its
          // background blue if it isn't already.
          editor.updateBlock(block, {
            props: { backgroundColor: "blue" },
          });
        } else if (
          block.id !== hoveredBlock.id &&
          block.props.backgroundColor === "blue"
        ) {
          // If the block is not currently hovered by the text cursor, resets
          // its background if it's blue.
          editor.updateBlock(block, {
            props: { backgroundColor: "default" },
          });
        }

        return true;
      });
    },
  });

  useEffect(() => {
    if (onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Renders the editor instance using a React component.
  return (
    <div className="border-2">
      <BlockNoteView editor={editor} />
    </div>
  );
};

export default Editor;
