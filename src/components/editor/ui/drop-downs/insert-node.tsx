import { LexicalEditor } from "lexical";
import React, { useMemo, lazy, Suspense } from "react";
import useModal from "../models/use-model";
import { AlertCircle, Columns2, Columns3, Columns4, FlipHorizontal2, Image, ImagePlay, PencilRuler, Plus, SquareChevronRight, SquarePenIcon, Table, Twitter, Youtube } from "lucide-react";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { DropDown } from ".";
import { INSERT_IMAGE_COMMAND, InsertImagePayload } from "../../plugins/ImagesPlugin";
import { Skeleton } from "@/components/ui/skeleton";
import { INSERT_LAYOUT_COMMAND } from "../../plugins/LayoutPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../../plugins/CollapsiblePlugin";
import { AutoEmbedDialog, TwitterEmbedConfig, YoutubeEmbedConfig } from "../../plugins/AutoEmbedPlugin";
import { INSERT_HINT_COMMAND } from "../../nodes/Hint";

const InsertImageDialog = lazy(() => import("@/components/editor/ui/models/insert-image").then(module => ({ default: module.InsertImageDialog })));
const InsertGif = lazy(() => import("../models/insert-gif"));
const InsertTableBody = lazy(() => import("@/components/editor/ui/models/insert-table").then(module => ({ default: module.InsertTable })));
const InsertPoll = lazy(() => 
  import("@/components/editor/ui/models/insert-poll").then(module => ({ default: module.InsertPoll }))
);

interface Items {
  label: string;
  icon: React.ReactNode;
  func: () => void;
  shortcuts?: string;
}

export default function InsertNode({
  disabled,
  editor,
}: {
  disabled: boolean;
  editor: LexicalEditor;
}) {
  const [model, showModal] = useModal();
  const insertGifOnClick = (payload: InsertImagePayload) => {
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const items: Items[] = useMemo(
    () => [
      {
        label: "Horizontal Rule",
        icon: <FlipHorizontal2 className="w-4 h-4" />,
        func: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
      },
      {
        label: "Image",
        icon: <Image className="size-4" />,
        func: () => {
          showModal(
            "Insert Image",
            "Please select an image to upload.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="mx-2 w-[350px] h-[350px]"/>}>
                <InsertImageDialog activeEditor={editor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: "GIF",
        icon: <ImagePlay className="w-4 h-4" />,
        func: () => {
          showModal(
            "Insert GIF",
            "Please select a GIF to upload.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="mx-2 w-[400px] h-[400px]"/>}>
                <InsertGif insertGifOnClick={insertGifOnClick} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: "Table",
        icon: <Table className="w-4 h-4" />,
        func: () => {
          showModal(
            "Insert Table",
            "Please configure your table.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="mx-2 w-[400px] h-[100px]"/>}>
                <InsertTableBody activeEditor={editor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: "Poll",
        icon: <SquarePenIcon className="w-4 h-4" />,
        func: () => {
          showModal(
            "Create Poll",
            "Please type your question.",
            (onClose) => (
              <Suspense fallback={<Skeleton className="mx-2 w-[400px] h-[100px]"/>}>
                <InsertPoll activeEditor={editor} onClose={onClose} />
              </Suspense>
            ),
            true
          );
        },
      },
      {
        label: "2 columns (equal width)",
        icon: <Columns2 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr");
        },
      },
      {
        label: "3 columns (equal width)",
        icon: <Columns3 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr");
        },
      },
      {
        label: "4 columns (equal width)",
        icon: <Columns4 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr");
        },
      },
      {
        label: "2 columns (25% - 75%)",
        icon: <Columns2 className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 3fr");
        },
      },
      {
        label: "Collapsible container",
        icon: <SquareChevronRight className="w-4 h-4" />,
        func: () => {
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
        },
      },
      {
        label: "Twitter",
        icon: <Twitter className="w-4 h-4" />,
        func: () => {
           
          showModal("Twitter tweet", "Insert a URL to embed a live preview. Works with Twitter, Google Drive, Vimeo, and more.", (onClose) => (
            <AutoEmbedDialog embedConfig={TwitterEmbedConfig} onClose={onClose} />
          ),true);
        },
      },
      {
        label: "Youtube",
        icon: <Youtube />,
        func: () => {
           
          showModal("Youtube", "Insert a URL to embed a live preview. Works with YouTube, Google Drive, Vimeo, and more.", (onClose) => (
            <AutoEmbedDialog embedConfig={YoutubeEmbedConfig} onClose={onClose} />
          ),true);
        },
      },
      {
        label:"Hint",
        icon:<AlertCircle/>,
        func:()=>{
          editor.dispatchCommand(INSERT_HINT_COMMAND,'info')
        }
      }
      
    ],
    [editor, showModal]
  );

  return (
    <>
      <DropDown
        values={items}
        TriggerClassName={{ width: "115px" }}
        TriggerLabel={
          <>
            <Plus />
            <span>Insert</span>
          </>
        }
        disabled={disabled}
      />
      {model}
    </>
  );
}