import React, { useEffect, useRef, useState, type JSX } from "react";

interface VisualViewportProps {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  [key: string]: any;
}

export const VisualViewport: React.FC<VisualViewportProps> = ({
  as: Element = "div",
  children,
  style = {},
  ...props
}) => {
  const ref = useRef<any>(null);

  const [viewport, setViewport] = useState<React.CSSProperties>({
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

      window?.visualViewport?.addEventListener("resize", updateViewport);

      return () =>
        window?.visualViewport?.removeEventListener("resize", updateViewport);
    }
  }, []);

  const ElementComponent = Element as any;

  return (
    <ElementComponent ref={ref} style={{ ...style, ...viewport }} {...props}>
      {children}
    </ElementComponent>
  );
};
