import type { AnyFieldApi } from "@tanstack/react-form";
interface CustomInputProps {
  placeholder?: string;
  label?: string;
  labelClass?: string;
  endContent?: React.ReactNode;
  startContent?: React.ReactNode;
}

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement> & CustomInputProps) {
  const { label, labelClass, className, endContent, startContent, ...rest } = props;
  return (
    <>
      {props.label && (
        <label
          htmlFor={props.id}
          className={"block pb-2 text-base font-medium text-text-default dark:text-gray-400" + (props.labelClass || "")}
        >
          {props.label}
        </label>
      )}
      <div className="relative flex items-center w-full h-full">
        {props.startContent && <div className="absolute left-0 p-2 text-text-default">{props.startContent}</div>}
        <input
          id={props.id}
          placeholder={props.placeholder ?? (props.label ? `Please enter ${props.label.toLowerCase()}` : "")}
          className={
            "w-full min-w-0 text-base leading-normal outline-none p-[15px] rounded-2xl border border-border-default text-text-primary dark:bg-gray-800 dark:text-text-inverse dark:placeholder-gray-400 " +
            (props.startContent ? "pl-12 " : "") +
            (props.endContent ? "pr-12 " : "") +
            (props.className || "")
          }
          {...rest}
        />
        {props.endContent && <div className="absolute right-0 p-2 text-text-default">{props.endContent}</div>}
      </div>
    </>
  );
}

export function ControlledInput(
  props: React.InputHTMLAttributes<HTMLInputElement> &
    CustomInputProps & {
      field: AnyFieldApi;
    }
) {
  const { field, ...rest } = props;
  return (
    <div className="flex flex-col items-start gap-1 w-full h-full">
      <Input
        {...rest}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
      />
      {!field.state.meta.isValid && (field.state.meta.isDirty || field.state.meta.isTouched) && (
        <em role="alert" className="text-xs text-red-500 dark:text-red-400 mt-3 ml-2 leading-0">
          {field.state.meta.errors[0].message}
        </em>
      )}
    </div>
  );
}
