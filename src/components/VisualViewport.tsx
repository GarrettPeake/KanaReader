import React, { useEffect, useRef, useState } from "react";

interface VisualViewportProps {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const VisualViewport: React.FC<VisualViewportProps> = ({
  as: Element = "div",
  children,
  style = {},
  ...props
}) => {
  const ref = useRef<HTMLElement>(null);

  const [viewport, setViewport] = useState({
    height: "100vh",
    width: "100vw",
  });

  const updateViewport = () => {
    if (window.visualViewport) {
      setViewport({
        height: `${window.visualViewport.height}px`,
        width: `${window.visualViewport.width}px`,
      });

      // Scroll to keep the content in view
      if (ref.current) {
        window.scrollTo(0, ref.current.offsetTop);
      }
    }
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.visualViewport !== "undefined"
    ) {
      updateViewport();

      window.visualViewport.addEventListener("resize", updateViewport);

      return () =>
        window.visualViewport.removeEventListener("resize", updateViewport);
    }
  }, []);

  return (
    <Element ref={ref} style={{ ...style, ...viewport }} {...props}>
      {children}
    </Element>
  );
};
