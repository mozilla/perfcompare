import React from 'react';

interface SkipLinkProperties {
  containerRef: React.RefObject<HTMLElement>;
  children: React.ReactElement;
}

const SkipLink: React.FC<SkipLinkProperties> = (props) => {
  const onClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const container: HTMLElement | null = props.containerRef.current;
    if (container) {
      container.tabIndex = -1;
      container.focus();
      setTimeout(() => container.removeAttribute('tabindex'), 1000);
    }
  };

  return React.cloneElement(props.children, {
    onClick,
    ref: props.containerRef,
  });
};

export default SkipLink;
