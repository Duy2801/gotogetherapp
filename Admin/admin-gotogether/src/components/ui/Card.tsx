import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function Card({ title, subtitle, children, className }: CardProps) {
  return (
    <section className={`panel ${className ?? ""}`.trim()}>
      {(title || subtitle) && (
        <div className="panel__header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
      )}
      <div className="panel__body">{children}</div>
    </section>
  );
}