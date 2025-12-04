import Link from "next/link";

type TagProps = {
  children: React.ReactNode;
  href?: string;
  count?: number;
  className?: string;
};

const Tag: React.FC<TagProps> = ({ children, href, count, className = "" }) => {
  const tagContent = (
    <div className={`group inline-flex items-center gap-1 ${className}`}>
      <span className="text-muted-foreground group-hover:text-primary transition-colors">
        #
      </span>
      <span className="text-foreground group-hover:text-primary transition-colors">
        {children}
      </span>
      {count && (
        <span className="text-muted-foreground bg-muted group-hover:bg-primary group-hover:text-primary-foreground rounded-full px-1.5 py-0.5 text-xs transition-colors">
          {count}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="decoration-primary mr-3 mb-2 inline-block cursor-pointer underline-offset-2 hover:underline"
      >
        {tagContent}
      </Link>
    );
  }

  return <div className="mr-3 mb-2 inline-block">{tagContent}</div>;
};

export default Tag;
