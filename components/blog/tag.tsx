import Link from "next/link";

type TagProps = {
  children: React.ReactNode;
  href?: string;
  count?: number;
  className?: string;
};

const Tag: React.FC<TagProps> = ({ children, href, count, className = "" }) => {
  const tagContent = (
    <div className={`inline-flex items-center gap-1 group ${className}`}>
      <span className="text-muted-foreground group-hover:text-primary transition-colors">
        #
      </span>
      <span className="text-foreground group-hover:text-primary transition-colors">
        {children}
      </span>
      {count && (
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {count}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="cursor-pointer hover:underline underline-offset-2 decoration-primary mr-3 mb-2 inline-block"
      >
        {tagContent}
      </Link>
    );
  }

  return <div className="mr-3 mb-2 inline-block">{tagContent}</div>;
};

export default Tag;
