import { Children, type ReactNode } from "react";
import { Panel } from "@/components/ui/panel";

type PaymentCategoryListPanelProps = {
  title: string;
  summary?: string;
  emptyMessage?: string;
  children?: ReactNode;
  footer?: ReactNode;
  append?: ReactNode;
};

export function PaymentCategoryListPanel({
  title,
  summary,
  emptyMessage,
  children,
  footer,
  append,
}: PaymentCategoryListPanelProps) {
  const isEmpty = Children.count(children) === 0;

  return (
    <Panel>
      <div className="ui-panel-header">
        <h2 className="ui-panel-title">{title}</h2>
        {summary ? (
          <span className="ui-panel-summary">{summary}</span>
        ) : null}
      </div>

      {isEmpty ? (
        emptyMessage ? <p className="ui-panel-empty">{emptyMessage}</p> : null
      ) : (
        <ul className="ui-row-list-in-panel">{children}</ul>
      )}

      {footer ? <div className="ui-panel-footer">{footer}</div> : null}
      {append ? <div className="ui-panel-footer space-y-3">{append}</div> : null}
    </Panel>
  );
}
