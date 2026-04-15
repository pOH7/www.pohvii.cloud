import Link from "next/link";

type TagProps = {
  children: React.ReactNode;
  href?: string;
  count?: number;
  className?: string;
};

const Tag: React.FC<TagProps> = ({ children, href, count, className = "" }) => {
  const tagContent = (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <span className="text-muted-foreground">#</span>
      <span className="text-foreground">{children}</span>
      {count && (
        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="mr-3 mb-2 inline-block cursor-pointer border-b-2 border-b-primary no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {tagContent}
      </Link>
    );
  }

  return <div className="mr-3 mb-2 inline-block">{tagContent}</div>;
};

export default Tag;
