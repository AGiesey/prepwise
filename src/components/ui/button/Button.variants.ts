import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "group relative w-full flex justify-center  border border-transparent text-sm font-medium rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
        outline: "border border-slate-200 hover:bg-slate-100",
      },
      size: {
        sm: "py-1 px-3",
        md: "py-2 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);