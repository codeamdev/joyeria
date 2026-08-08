"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FieldWrapper, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { GemstoneFields, type GemstoneItem } from "@/components/admin/gemstone-fields";
import { ProductImageManager, type ImageItem } from "@/components/admin/product-image-manager";
import { slugify } from "@/lib/slugify";
import { MATERIAL_LABELS, MATERIAL_VALUES, STATUS_LABELS, STATUS_VALUES } from "@/lib/validation/product";
import type { ProductInput } from "@/lib/validation/product";
import { createProduct, updateProduct } from "./actions";

type CategoryOption = { id: string; name: string };

export type ProductFormInitialValues = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  material: (typeof MATERIAL_VALUES)[number];
  purity: string;
  weightGrams: number | null;
  price: number;
  internalCost: number | null;
  isOneOfAKind: boolean;
  isCustomizable: boolean;
  productionTimeDays: number | null;
  status: (typeof STATUS_VALUES)[number];
  careInstructions: string;
  ringSize: string;
  chainLengthCm: number | null;
  braceletLengthCm: number | null;
  dimensionsNote: string;
  certifyingEntity: string;
  certificationNumber: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  gemstones: GemstoneItem[];
  images: ImageItem[];
};

const emptyInitialValues: ProductFormInitialValues = {
  id: "",
  sku: "",
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  categoryId: "",
  material: "PLATA",
  purity: "",
  weightGrams: null,
  price: 0,
  internalCost: null,
  isOneOfAKind: false,
  isCustomizable: false,
  productionTimeDays: null,
  status: "DISPONIBLE",
  careInstructions: "",
  ringSize: "",
  chainLengthCm: null,
  braceletLengthCm: null,
  dimensionsNote: "",
  certifyingEntity: "",
  certificationNumber: "",
  metaTitle: "",
  metaDescription: "",
  featured: false,
  gemstones: [],
  images: [],
};

export function ProductForm({
  mode,
  categories,
  initialValues,
}: {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initialValues?: ProductFormInitialValues;
}) {
  const router = useRouter();
  const initial = initialValues ?? emptyInitialValues;

  const [values, setValues] = useState(initial);
  const [gemstones, setGemstones] = useState<GemstoneItem[]>(initial.gemstones);
  const [images, setImages] = useState<ImageItem[]>(initial.images);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof ProductFormInitialValues>(key: K, val: ProductFormInitialValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const payload: ProductInput = {
      sku: values.sku,
      name: values.name,
      slug: values.slug,
      description: values.description,
      shortDescription: values.shortDescription,
      categoryId: values.categoryId,
      material: values.material,
      purity: values.purity,
      weightGrams: values.weightGrams,
      price: values.price,
      internalCost: values.internalCost,
      isOneOfAKind: values.isOneOfAKind,
      isCustomizable: values.isCustomizable,
      productionTimeDays: values.productionTimeDays,
      status: values.status,
      careInstructions: values.careInstructions,
      ringSize: values.ringSize,
      chainLengthCm: values.chainLengthCm,
      braceletLengthCm: values.braceletLengthCm,
      dimensionsNote: values.dimensionsNote,
      certifyingEntity: values.certifyingEntity,
      certificationNumber: values.certificationNumber,
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
      featured: values.featured,
      gemstones: gemstones.map(({ id: _id, ...rest }) => rest),
      images: images.map(({ id: _id, ...rest }) => rest),
    };

    startTransition(async () => {
      const result =
        mode === "create" ? await createProduct(payload) : await updateProduct(initial.id, payload);

      if (result.error) setError(result.error);
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      if (!result.error && !result.fieldErrors) {
        router.push("/admin/products");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 pb-16">
      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Identificación</h2>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="SKU" htmlFor="sku" error={fieldErrors.sku}>
            <Input id="sku" value={values.sku} onChange={(e) => set("sku", e.target.value)} required />
          </FieldWrapper>
          <FieldWrapper label="Categoría" htmlFor="categoryId" error={fieldErrors.categoryId}>
            <select
              id="categoryId"
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              required
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            >
              <option value="">Selecciona…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FieldWrapper>
        </div>

        <FieldWrapper label="Nombre" htmlFor="name" error={fieldErrors.name}>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            required
          />
        </FieldWrapper>

        <FieldWrapper label="Slug" htmlFor="slug" error={fieldErrors.slug} hint="Usado en la URL pública">
          <Input
            id="slug"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            required
          />
        </FieldWrapper>

        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="Estado" htmlFor="status">
            <select
              id="status"
              value={values.status}
              onChange={(e) => set("status", e.target.value as ProductFormInitialValues["status"])}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            >
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </FieldWrapper>
          <div className="flex items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm text-ink/80">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Destacado en inicio
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Material y piedras</h2>
        <div className="grid grid-cols-3 gap-4">
          <FieldWrapper label="Material" htmlFor="material">
            <select
              id="material"
              value={values.material}
              onChange={(e) => set("material", e.target.value as ProductFormInitialValues["material"])}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            >
              {MATERIAL_VALUES.map((m) => (
                <option key={m} value={m}>
                  {MATERIAL_LABELS[m]}
                </option>
              ))}
            </select>
          </FieldWrapper>
          <FieldWrapper label="Pureza" htmlFor="purity" hint="ej. 18k, 14k, 925">
            <Input id="purity" value={values.purity} onChange={(e) => set("purity", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Peso (g)" htmlFor="weightGrams">
            <Input
              id="weightGrams"
              type="number"
              step="0.01"
              min="0"
              value={values.weightGrams ?? ""}
              onChange={(e) => set("weightGrams", e.target.value === "" ? null : Number(e.target.value))}
            />
          </FieldWrapper>
        </div>

        <GemstoneFields value={gemstones} onChange={setGemstones} />
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Precio</h2>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="Precio de venta" htmlFor="price" error={fieldErrors.price}>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={values.price}
              onChange={(e) => set("price", Number(e.target.value))}
              required
            />
          </FieldWrapper>
          <FieldWrapper label="Costo interno" htmlFor="internalCost" hint="Solo visible en el panel">
            <Input
              id="internalCost"
              type="number"
              step="0.01"
              min="0"
              value={values.internalCost ?? ""}
              onChange={(e) => set("internalCost", e.target.value === "" ? null : Number(e.target.value))}
            />
          </FieldWrapper>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Piezas únicas y personalización</h2>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={values.isOneOfAKind}
              onChange={(e) => set("isOneOfAKind", e.target.checked)}
            />
            Pieza única
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={values.isCustomizable}
              onChange={(e) => set("isCustomizable", e.target.checked)}
            />
            Acepta personalización / encargo
          </label>
        </div>
        {values.isCustomizable ? (
          <FieldWrapper
            label="Tiempo estimado de producción (días)"
            htmlFor="productionTimeDays"
          >
            <Input
              id="productionTimeDays"
              type="number"
              min="0"
              value={values.productionTimeDays ?? ""}
              onChange={(e) =>
                set("productionTimeDays", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </FieldWrapper>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Dimensiones</h2>
        <div className="grid grid-cols-3 gap-4">
          <FieldWrapper label="Talla de anillo" htmlFor="ringSize">
            <Input id="ringSize" value={values.ringSize} onChange={(e) => set("ringSize", e.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Longitud cadena (cm)" htmlFor="chainLengthCm">
            <Input
              id="chainLengthCm"
              type="number"
              step="0.1"
              min="0"
              value={values.chainLengthCm ?? ""}
              onChange={(e) => set("chainLengthCm", e.target.value === "" ? null : Number(e.target.value))}
            />
          </FieldWrapper>
          <FieldWrapper label="Longitud pulsera (cm)" htmlFor="braceletLengthCm">
            <Input
              id="braceletLengthCm"
              type="number"
              step="0.1"
              min="0"
              value={values.braceletLengthCm ?? ""}
              onChange={(e) =>
                set("braceletLengthCm", e.target.value === "" ? null : Number(e.target.value))
              }
            />
          </FieldWrapper>
        </div>
        <FieldWrapper label="Nota de dimensiones" htmlFor="dimensionsNote" hint="Para cualquier medida no cubierta arriba">
          <Input
            id="dimensionsNote"
            value={values.dimensionsNote}
            onChange={(e) => set("dimensionsNote", e.target.value)}
          />
        </FieldWrapper>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Descripción</h2>
        <FieldWrapper label="Descripción corta" htmlFor="shortDescription" hint="Para tarjetas del catálogo">
          <Input
            id="shortDescription"
            value={values.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper label="Descripción completa" htmlFor="description">
          <Textarea
            id="description"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="min-h-32"
          />
        </FieldWrapper>
        <FieldWrapper label="Cuidados" htmlFor="careInstructions">
          <Textarea
            id="careInstructions"
            value={values.careInstructions}
            onChange={(e) => set("careInstructions", e.target.value)}
          />
        </FieldWrapper>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Certificación (opcional)</h2>
        <div className="grid grid-cols-2 gap-4">
          <FieldWrapper label="Entidad certificadora" htmlFor="certifyingEntity">
            <Input
              id="certifyingEntity"
              value={values.certifyingEntity}
              onChange={(e) => set("certifyingEntity", e.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper label="Número de certificado" htmlFor="certificationNumber">
            <Input
              id="certificationNumber"
              value={values.certificationNumber}
              onChange={(e) => set("certificationNumber", e.target.value)}
            />
          </FieldWrapper>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">SEO</h2>
        <FieldWrapper label="Meta título" htmlFor="metaTitle">
          <Input id="metaTitle" value={values.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
        </FieldWrapper>
        <FieldWrapper label="Meta descripción" htmlFor="metaDescription">
          <Textarea
            id="metaDescription"
            value={values.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
          />
        </FieldWrapper>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg text-ink">Imágenes</h2>
        <ProductImageManager value={images} onChange={setImages} />
      </section>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-ink/10 bg-ivory py-4">
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/products")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : mode === "create" ? "Crear producto" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
