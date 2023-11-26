import { Button } from "tamagui";

// Primary Button
export const PrimaryButton = (props: any) => {
  return (
    <Button backgroundColor="$blue10" color="white" {...props}>
      {props.children}
    </Button>
  );
};

// Secondary Button
export const SecondaryButton = (props: any) => {
  return (
    <Button color="white" backgroundColor="$blue8" {...props}>
      {props.children}
    </Button>
  );
};

// Outline Button
export const OutlinedButton = (props: any) => {
  return (
    <Button variant={"outlined"} borderWidth={1} color="$gray10" {...props}>
      {props.children}
    </Button>
  );
};

export const WarningButton = (props: any) => {
  return (
    <Button themeInverse backgroundColor="$red10" {...props}>
      {props.children}
    </Button>
  );
};
