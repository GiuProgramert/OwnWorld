import FormContainer from "@/components/form-container";
import CreateMovementTypeForm from "@/components/movement-types/create-form";

export default function CreateMovementTypePage() {
  return (
    <FormContainer
      title="Crear un nuevo tipo de movimiento"
      href="/protected/finance/movement-types"
    >
      <CreateMovementTypeForm />
    </FormContainer>
  );
}
