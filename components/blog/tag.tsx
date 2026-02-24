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
        <span className="text-muted-foreground bg-muted rounded-sm px-1.5 py-0.5 text-xs">
          {count}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="border-b-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary mr-3 mb-2 inline-block cursor-pointer border-b-2 no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {tagContent}
      </Link>
    );
  }

  return <div className="mr-3 mb-2 inline-block">{tagContent}</div>;
};

export default Tag;
