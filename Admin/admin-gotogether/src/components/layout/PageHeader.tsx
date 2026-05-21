import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function PageHeader({ title, description, actionLabel, actionHref }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">Bảng quản trị GoTogether</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {actionLabel && actionHref ? (
        <Link className="btn btn--solid" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}