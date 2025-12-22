import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href="/" className="flex-1 flex items-center gap-2 text-2xl ">
      <span className="inline-block font-extrabold text-primary">X</span>
      <span className="text-foreground font-semibold">design.ai</span>
    </Link>
  );
};

export default Logo;
