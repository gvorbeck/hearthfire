import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description: string;
  image?: string;
}

export const PageMeta = ({ title, description, image }: Props) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {image && <meta property="og:image" content={image} />}
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {image && <meta name="twitter:image" content={image} />}
  </Helmet>
);
