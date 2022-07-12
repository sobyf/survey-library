import * as ko from "knockout";
import { RendererFactory } from "survey-core";

const template = require("./text-contenteditable.html");

export var ContentEditableViewModel: any;

ko.components.register("sv-text-contenteditable", {
  viewModel: {
    createViewModel: (params: any, componentInfo: any) => {
      return {
        question: params.question,
        oninput: (data: any, event: any) => {
          params.question.sanitizeOnChange(event);
        }
      };
    },
  },
  template: template,
});

RendererFactory.Instance.registerRenderer(
  "text",
  "contenteditable",
  "sv-text-contenteditable"
);
