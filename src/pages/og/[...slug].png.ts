import type {
  APIContext,
  InferGetStaticParamsType,
  InferGetStaticPropsType,
} from "astro";
import { allBlogCollection, allBlogTagList, util } from "@/content";
import {
  type ImageSize,
  type TextStyle,
  OgImageGenerator,
} from "@/../plugins/og-image-generator";
import { loadImage } from "canvas";
import path from "path";

import IBMPlexSansJP from "@/assets/IBMPlexSansJP-SemiBold.otf";
import PostPNG from "@/assets/post.png";
import PagePNG from "@/assets/page.png";

function resolveObjPath(objPath: string) {
  const distRelative = path.join("./dist", objPath);
  return path.resolve(distRelative);
}

const imageSize: ImageSize = {
  width: 1200,
  height: 630,
};

const fontData = {
  path: resolveObjPath(IBMPlexSansJP),
  family: "IBMPlexSansJP",
};

const generatorBlogPost = new OgImageGenerator(imageSize, {
  ...fontData,
  size: 56,
});

const generatorOtherPage = new OgImageGenerator(imageSize, {
  ...fontData,
  size: 92,
});

export function getStaticPaths() {
  const blogPostData = allBlogCollection.map((post) => ({
    slug: path.join("/blog/", post.slug),
    text: post.data.title,
  }));

  const blogTagData = allBlogTagList.map((tag) => ({
    slug: path.join("/blog/tag/", tag.name),
    text: `Blog.Tag.${tag.name}`,
  }));

  const blogYearData = allBlogCollection
    .map((post) => util.getYearFromSlug(post.slug))
    .filter((year, index, self) => self.indexOf(year) === index)
    .map((year) => ({
      slug: path.join("/blog/", year),
      text: `Blog.${year},`,
    }));

  return [
    { slug: "index", text: "ryota2357.com" },
    { slug: "/about", text: "About" },
    { slug: "/blog", text: "Blog" },
    { slug: "/blog/tag", text: "Blog.Tag" },
    { slug: "/works", text: "Works" },
  ]
    .concat(...blogPostData)
    .concat(...blogTagData)
    .concat(...blogYearData)
    .map((data) => ({
      params: { slug: data.slug },
      props: { text: data.text },
    }));
}

export async function GET({
  params,
  props,
}: APIContext<
  InferGetStaticPropsType<typeof getStaticPaths>,
  InferGetStaticParamsType<typeof getStaticPaths>
>) {
  const { slug } = params;
  const { text } = props;
  const style: TextStyle = {
    lineHeight: 1.7,
    padding: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    },
  };

  const png = await (async () => {
    if (/\/blog\/\d{4}\//.test(slug)) {
      const bgImage = await loadImage(resolveObjPath(PostPNG.src));
      return generatorBlogPost.generatePNG(text, bgImage, {
        ...style,
        padding: {
          ...style.padding,
          top: 60,
          bottom: 140,
        },
      });
    } else {
      const bgImage = await loadImage(resolveObjPath(PagePNG.src));
      return generatorOtherPage.generatePNG(text, bgImage, {
        ...style,
      });
    }
  })();

  return new Response(png);
}