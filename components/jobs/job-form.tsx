import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PhotoUploader } from "@/components/jobs/photo-uploader";
import { createJob } from "@/server/actions/jobs";
import type { Customer } from "@/types/customer";
import type { Job } from "@/types/job";

type JobFormProps = {
  customers: Customer[];
  job?: Job;
  action?: (formData: FormData) => void | Promise<void>;
};

export function JobForm({ customers, job, action = createJob }: JobFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <Field label="Kunde">
        <Select name="customer_id" required defaultValue={job?.customer_id ?? customers[0]?.id}>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.business_name || customer.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Jobtitel">
        <Input name="title" placeholder="Badarmatur tauschen" defaultValue={job?.title ?? ""} required />
      </Field>
      <Field label="Einsatzort">
        <Input name="location" placeholder="Adresse oder Raum" defaultValue={job?.location ?? ""} required />
      </Field>
      <Field label="Beschreibung">
        <Textarea name="description" placeholder="Was wurde erledigt?" defaultValue={job?.description ?? ""} required />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stunden">
          <Input name="labor_hours" type="number" min="0" step="0.25" defaultValue={job?.labor_hours ?? 1} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={job?.status ?? "active"}>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="completed">completed</option>
            {job?.status === "invoiced" ? <option value="invoiced">invoiced</option> : null}
          </Select>
        </Field>
      </div>
      <PhotoUploader />
      <Field label="Interne Notizen">
        <Textarea name="internal_notes" defaultValue={job?.internal_notes ?? ""} />
      </Field>
      <Button type="submit">{job ? "Job aktualisieren" : "Job speichern"}</Button>
    </form>
  );
}
