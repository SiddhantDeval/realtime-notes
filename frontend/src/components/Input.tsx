interface InputProps {
  label?: string;
  labelClass?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  type?: string;
  required?: boolean;
  className?: string;
  id?: string;
  autoComplete?: string;
  disabled?: boolean;
  endContent?: React.ReactNode;
  startContent?: React.ReactNode;
}

export default function Input(props: InputProps) {
  return (
    <div>
      {props.label && (
        <label
          htmlFor={props.id || props.name}
          className={"block pb-2 text-base font-medium text-text-default dark:text-gray-400" + (props.labelClass || "")}
        >
          {props.label}
        </label>
      )}
      <div className="relative flex items-center">
        {props.startContent && (
          <div className="absolute left-0 pl-3 text-text-default">
            {props.startContent}
          </div>
        )}
        <input
          id={props.id || props.name}
          name={props.name}
          type={props.type}
          autoComplete={props.autoComplete}
          required={props.required}
          placeholder={props.placeholder ?? (props.label ? `Please enter ${props.label.toLowerCase()}` : '')}
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
          className={
            "w-full min-w-0 resize-none overflow-hidden text-base leading-normal outline-none p-[15px] rounded-2xl border border-border-default bg-text-inverse text-text-primary dark:bg-gray-800 dark:text-text-inverse dark:placeholder-gray-400 " +
            (props.startContent ? "pl-10 " : "") +
            (props.endContent ? "pr-10 " : "") +
            (props.className || "")
          }
        />
        {props.endContent && (
          <div className="absolute right-0 pr-3 text-text-default">
            {props.endContent}
          </div>
        )}
      </div>
    </div>
  );
}


