'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Phone, Globe, UtensilsCrossed, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateRestaurant } from '@/hooks/useRestaurants';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  cuisineTypes: z.string().min(1, 'Enter at least one cuisine'),
  priceRange: z.coerce.number().min(1).max(4),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1).default('India'),
    zipCode: z.string().min(1),
  }),
  location: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([z.coerce.number(), z.coerce.number()]),
  }),
  preparationTime: z.coerce.number().min(5).max(120).default(30),
  taxPercentage: z.coerce.number().min(0).max(30).default(5),
  serviceChargePercentage: z.coerce.number().min(0).max(30).default(10),
  acceptsTableBooking: z.boolean().default(true),
  acceptsPreOrders: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Basic Info', 'Location', 'Settings'];

export default function NewRestaurantPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { mutate: createRestaurant, isPending } = useCreateRestaurant();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priceRange: 2,
      preparationTime: 30,
      taxPercentage: 5,
      serviceChargePercentage: 10,
      acceptsTableBooking: true,
      acceptsPreOrders: true,
      address: { country: 'India' },
      location: { type: 'Point', coordinates: [0, 0] },
    },
  });

  const onSubmit = (data: FormData) => {
    const cuisineTypes = data.cuisineTypes.split(',').map((c) => c.trim()).filter(Boolean);
    createRestaurant({ ...data, cuisineTypes } as Parameters<typeof createRestaurant>[0], {
      onSuccess: () => router.push('/dashboard'),
    });
  };

  const nextStep = async () => {
    const fields: (keyof FormData)[][] = [
      ['name', 'description', 'phone', 'cuisineTypes', 'priceRange'],
      ['address'],
      ['preparationTime', 'taxPercentage', 'serviceChargePercentage'],
    ];
    const valid = await trigger(fields[step] as (keyof FormData)[]);
    if (valid) setStep((s) => s + 1);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Register New Restaurant</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to list your restaurant on QuickBite</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-green-500' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="space-y-5 p-6 rounded-2xl border bg-card">
              <h2 className="font-semibold flex items-center gap-2"><UtensilsCrossed className="h-5 w-5 text-brand-500" /> Basic Information</h2>
              <Input label="Restaurant Name" placeholder="e.g. The Spice Garden" error={errors.name?.message} {...register('name')} />
              <div>
                <label className="block text-sm font-medium mb-1.5">Description <span className="text-destructive">*</span></label>
                <textarea
                  className="w-full h-24 px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tell customers about your restaurant, ambiance, specialties..."
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} placeholder="+91 9876543210" error={errors.phone?.message} {...register('phone')} />
                <Input label="Email (optional)" type="email" error={errors.email?.message} {...register('email')} />
              </div>
              <Input label="Website (optional)" leftIcon={<Globe className="h-4 w-4" />} placeholder="https://yourrestaurant.com" {...register('website')} />
              <Input label="Cuisine Types" placeholder="Indian, Chinese, Italian (comma separated)" error={errors.cuisineTypes?.message} {...register('cuisineTypes')} />
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-3">
                  {[{ v: 1, l: '₹' }, { v: 2, l: '₹₹' }, { v: 3, l: '₹₹₹' }, { v: 4, l: '₹₹₹₹' }].map(({ v, l }) => (
                    <label key={v} className="flex-1 cursor-pointer">
                      <input type="radio" value={v} {...register('priceRange')} className="sr-only peer" />
                      <div className="py-3 text-center border-2 rounded-xl text-sm font-semibold peer-checked:border-brand-500 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-950 peer-checked:text-brand-600 transition-all hover:border-brand-300">{l}</div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-5 p-6 rounded-2xl border bg-card">
              <h2 className="font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-brand-500" /> Location</h2>
              <Input label="Street Address" placeholder="123 Main Street" error={errors.address?.street?.message} {...register('address.street')} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="City" placeholder="Mumbai" error={errors.address?.city?.message} {...register('address.city')} />
                <Input label="State" placeholder="Maharashtra" error={errors.address?.state?.message} {...register('address.state')} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="ZIP Code" placeholder="400001" error={errors.address?.zipCode?.message} {...register('address.zipCode')} />
                <Input label="Country" defaultValue="India" {...register('address.country')} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Longitude" type="number" step="any" placeholder="72.8777" {...register('location.coordinates.0')} />
                <Input label="Latitude" type="number" step="any" placeholder="19.0760" {...register('location.coordinates.1')} />
              </div>
              <p className="text-xs text-muted-foreground">Tip: Find your coordinates at maps.google.com — right-click on your location</p>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-5 p-6 rounded-2xl border bg-card">
              <h2 className="font-semibold">Operational Settings</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Prep Time (min)" type="number" min="5" {...register('preparationTime')} />
                <Input label="Tax %" type="number" step="0.5" min="0" {...register('taxPercentage')} />
                <Input label="Service Charge %" type="number" step="0.5" min="0" {...register('serviceChargePercentage')} />
              </div>
              <div className="space-y-3">
                {[
                  { name: 'acceptsTableBooking' as const, label: 'Accept table bookings', desc: 'Customers can reserve tables at your restaurant' },
                  { name: 'acceptsPreOrders' as const, label: 'Accept pre-orders', desc: 'Customers can pre-order food before arriving' },
                ].map(({ name, label, desc }) => (
                  <label key={name} className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:bg-muted/50 transition-colors">
                    <input type="checkbox" defaultChecked {...register(name)} className="mt-0.5 w-4 h-4 rounded accent-brand-500" />
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button type="button" variant="outline" className="gap-2" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" className="gap-2 flex-1" onClick={nextStep}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1" isLoading={isPending}>
              Submit for Approval
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
