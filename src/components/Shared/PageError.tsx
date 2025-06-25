import { useEffect } from 'react';

import { useRouteError } from 'react-router';
import { style } from 'typestyle';

import { LinkToHome } from './LinkToHome';
import PerfCompareHeader from './PerfCompareHeader';
import { useAppSelector } from '../../hooks/app';
import { SearchContainerStyles, background } from '../../styles';

interface PageErrorProps {
  title: string;
}

export function PageError({ title }: PageErrorProps) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  useEffect(() => {
    document.title = title;
  }, [title]);

  const styles = {
    container: style({
      backgroundColor: background(themeMode),
    }),
  };

  const sectionStyles = SearchContainerStyles(themeMode, /* isHome */ false);

  const error = useRouteError() as Error;
  console.error(error);

  return (
    <div className={styles.container}>
      <PerfCompareHeader />
      <section className={sectionStyles.container}>
        <LinkToHome />
        <p>Error: {error.message}</p>
        <p>
          More information about this error has been written to the Web Console.
        </p>
      </section>
    </div>
  );
}
