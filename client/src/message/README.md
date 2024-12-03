# Message usage doc

1. import { useMessage } from "./MessageContext";
2. const { showMessage } = useMessage();
3. showMessage({ type: "success", message: "This is a success message!" });

type: "success" | "info" | "warning" | "error"