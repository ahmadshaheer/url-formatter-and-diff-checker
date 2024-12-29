declare module "jsoneditor-react" {
  import { Component } from "react";

  export class JsonEditor extends Component<{
    value: any;
    onChange?: (value: any) => void;
    mode?: "tree" | "view" | "form" | "code" | "text";
    history?: boolean;
    ace?: any;
    theme?: string;
  }> {}
}
