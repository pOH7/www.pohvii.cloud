import React from "react";

// Optional: map/augment elements for MDX rendering
export const mdxComponents = {
  // Example: style anchors/headings subtly
  a: (props: React.ComponentProps<"a">) => (
    <a
      {...props}
      className={`underline decoration-dotted hover:decoration-solid ${props.className ?? ""}`}
    />
  ),
};

export type MdxComponents = typeof mdxComponents;
