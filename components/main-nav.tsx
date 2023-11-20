"use client";

import React, { MouseEvent } from "react";

import { Check, ChevronsUpDown, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "./ui/button";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();


  const routes = [
    {
      href: `/${params.storeId}`,
      label: 'סקירה',
      active: pathname === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: 'מודעות',
      active: pathname === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/categories`,
      label: 'קטגוריות',
      active: pathname === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: 'מידות',
      active: pathname === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/colors`,
      label: 'צבעים',
      active: pathname === `/${params.storeId}/colors`,
    },
    {
      href: `/${params.storeId}/products`,
      label: 'מוצרים',
      active: pathname === `/${params.storeId}/products`,
    },
    {
      href: `/${params.storeId}/orders`,
      label: 'הזמנות',
      active: pathname === `/${params.storeId}/orders`,
    },
    {
      href: `/${params.storeId}/settings`,
      label: 'הגדרות',
      active: pathname === `/${params.storeId}/settings`,
    },
  ];

  const [open, setOpen] = React.useState(false); // Make sure this line is present

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      
      const closePopoverOnClickOutside = (event: Event) => {
        const castedEvent = event as unknown as MouseEvent;
        if (isMobile && open && !(castedEvent.target as Element).closest("[data-popover]")) {
          setOpen(false);
        }
      };
      
      

      window.addEventListener("click", closePopoverOnClickOutside);

      return () => {
        window.removeEventListener("click", closePopoverOnClickOutside);
      };
    }
  }, [isMobile, open]);


  if (isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="בחר חנות"
          className={cn("flex items-center", className)}
          data-popover
            {...props}
        >
           תפריט
          <ChevronsUpDown className="mr-2 h-4 w-4 opacity-50" />
        </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandGroup heading="ניווט">
                {routes.map((route) => (
                  <Link href={route.href} passHref key={route.href}>
                    <CommandItem
                      
                      className="text-sm"
                      onSelect={() => {
                        setOpen(false);
                      }}
                    >
                      {route.label}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          route.active ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  </Link>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <nav className={cn("flex items-center", className)} {...props}>
      {routes.map((route, index) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-black dark:text-white' : 'text-muted-foreground',
            index > 0 && 'mr-4',
            index > 0 && 'lg:mr-10',
          )}>
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
