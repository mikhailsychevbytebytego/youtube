import NextImage, { type ImageProps } from "next/image";

export function Image(props: ImageProps) {
  const isVideoDelivery =
    typeof props.src === "string" && props.src.includes("videodelivery.net");

  return <NextImage {...props} unoptimized={props.unoptimized ?? isVideoDelivery} />;
}
