import NextLink from "next/link";
import { styled } from "../../lib/styles/stitches.config";

const Link = styled("a", {
  display: "inline-block",
  color: "$mediumDark",
  textDecoration: "none",
  padding: "0.6em",

  variants: {
    // indicate active page/section
    current: {
      true: {
        marginBottom: "-0.2em",
        borderBottom: "0.2em solid",
        borderColor: "$linkUnderline",
      },
      false: {
        "&:hover": {
          marginBottom: "-0.2em",
          borderBottom: "0.2em solid",
          borderColor: "$kindaLight",
        },
      },
    },
  },
});

const Icon = styled("svg", {
  width: "1.25em",
  height: "1.25em",
  verticalAlign: "-0.3em",

  "@medium": {
    width: "1.8em",
    height: "1.8em",
  },
});

const Label = styled("span", {
  fontSize: "0.95em",
  fontWeight: 500,
  marginLeft: "0.4em",

  "@medium": {
    display: "none",
  },
});

export type MenuItemProps = {
  href?: string;
  text?: string;
  current?: boolean;
  className?: string;

  // `any` avoids conflicts with @svgr/webpack, see: node_modules/next/image-types/global.d.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
};

const MenuItem = ({ icon: ItemIcon, href, text, current, className }: MenuItemProps) => {
  const linkContent = (
    <>
      <Icon as={ItemIcon} /> {text && <Label>{text}</Label>}
    </>
  );

  // allow both navigational links and/or other interactive react components (e.g. the theme toggle)
  if (href) {
    return (
      <NextLink href={href} prefetch={false} passHref={true}>
        <Link className={className} current={current}>
          {linkContent}
        </Link>
      </NextLink>
    );
  } else {
    return linkContent;
  }
};

export default MenuItem;
