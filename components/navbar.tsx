import { UserButton, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Store } from "lucide-react"

import StoreSwitcher from "@/components/store-switcher";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import prismadb from "@/lib/prismadb";

const Navbar = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId,
    }
  });

  return ( 
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        
        <div className="flex items-center ml-2">
          <Store className=" h-4 w-8" />
          {stores[0].name }
        </div>
        <MainNav className="mx-6 " />
        <div className="mr-auto flex items-center gap-4">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};
 
export default Navbar;
