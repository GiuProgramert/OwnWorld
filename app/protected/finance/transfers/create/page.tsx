import CreateTransferForm from "@/components/transfers/create-form";
import FormContainer from "@/components/form-container";
import { getAccounts } from "@/lib/services/accounts";

export default async function CreateTransferPage() {
  const accounts = await getAccounts();

  return (
    <FormContainer title="Nueva transferencia" href="/protected/finance/movements">
      <CreateTransferForm accounts={accounts} />
    </FormContainer>
  );
}
