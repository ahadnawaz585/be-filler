
"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      console.log("Checking auth...");
      const user = Cookies.get("user")
      const token = Cookies.get("token")
      console.log("Cookies - user:", user, "token:", token);
      if (user && token) {
        try {
          const parsedUser = JSON.parse(user)
          if (parsedUser.role) {
            setIsLoggedIn(true)
            setUserRole(parsedUser.role)
            console.log("Logged in, role:", parsedUser.role);
          } else {
            console.log("Invalid user data: no role");
            setIsLoggedIn(false)
            setUserRole(null)
          }
        } catch (error) {
          console.error("Error parsing user cookie:", error);
          setIsLoggedIn(false)
          setUserRole(null)
        }
      } else {
        console.log("Not logged in: missing user or token");
        setIsLoggedIn(false)
        setUserRole(null)
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    checkAuth()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogOut = () => {
    console.log("Logging out...");
    Cookies.remove("user", { path: "/" })
    Cookies.remove("token", { path: "/" })
    setIsLoggedIn(false)
    setUserRole(null)
    setIsMenuOpen(false)
    // Re-check auth to ensure state is updated
    const user = Cookies.get("user")
    const token = Cookies.get("token")
    console.log("After logout - user:", user, "token:", token);
    if (!user && !token) {
      console.log("Cookies cleared successfully");
    } else {
      console.warn("Cookies not cleared properly");
    }
    router.push("/")
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  const serviceLinks = [
    {
      name: "Income Tax Returns",
      path: "/services/income-tax-returns",
      subServices: [
        { name: "Tax Filing", path: "/services/income-tax-returns/tax-filing" },
        { name: "Wealth Statement", path: "/services/income-tax-returns/wealth-statement" },
      ],
    },
    { name: "Tax Registration", path: "/services/tax-registration" },
    { name: "Corporate Services", path: "/services/corporate" },
    { name: "Compliance Advisory", path: "/services/compliance" },
    { name: "Certificate Issuance", path: "/services/certificate-issuance" },
  ]

  const loggedInLinks = {
    user: [{ name: "Dashboard", path: "/dashboard" }],
    admin: [{ name: "Admin Panel", path: "/dashboard/admin" }],
    accountant: [{ name: "Accounts", path: "/dashboard/accountant" }],
  }

  console.log("Rendering Header - isLoggedIn:", isLoggedIn, "userRole:", userRole);

  return (
    <header
      className={cn("fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300", {
        "bg-background border-b shadow-sm": isScrolled,
        "bg-background": !isScrolled,
      })}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="https://www.befiler.com/dashboard/assets/images/logo.png"
                alt="Befiler Logo"
                width={120}
                height={40}
                priority
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <React.Fragment key={link.name}>
                {link.name === "Services" ? (
                  <div className="relative group">
                    <button
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent",
                        pathname.startsWith("/services") ? "text-primary" : "text-foreground",
                      )}
                    >
                      {link.name} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 h-2 w-full"></div>
                    <div className="absolute left-0 top-full w-64 rounded-md shadow-lg py-1 bg-background border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                      {serviceLinks.map((service) => (
                        <React.Fragment key={service.name}>
                          {service.subServices ? (
                            <div className="relative group/nested">
                              <Link
                                href={service.path}
                                className="flex items-center justify-between px-4 py-2 text-sm hover:bg-accent"
                              >
                                <span>{service.name}</span>
                                <ChevronDown className="h-4 w-4" />
                              </Link>
                              <div className="absolute left-full top-0 w-48 rounded-md shadow-lg py-1 bg-background border border-border opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-150">
                                {service.subServices.map((subService) => (
                                  <Link
                                    key={subService.name}
                                    href={subService.path}
                                    className="block px-4 py-2 text-sm hover:bg-accent"
                                  >
                                    {subService.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Link href={service.path} className="block px-4 py-2 text-sm hover:bg-accent">
                              {service.name}
                            </Link>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.path}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent",
                      pathname === link.path ? "text-primary" : "text-foreground",
                    )}
                  >
                    {link.name}
                  </Link>
                )}
              </React.Fragment>
            ))}

            {isLoggedIn &&
              userRole &&
              loggedInLinks[userRole as keyof typeof loggedInLinks]?.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent",
                    pathname === link.path ? "text-primary" : "text-foreground",
                  )}
                >
                  {link.name}
                </Link>
              ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <ModeToggle />
            {isLoggedIn ? (
              <Button variant="outline" onClick={handleLogOut}>
                Log Out
              </Button>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default" className="bg-[#af0e0e] hover:bg-[#8a0b0b]">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ModeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <React.Fragment key={link.name}>
                {link.name === "Services" ? (
                  <div className="py-2">
                    <button
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-base font-medium rounded-md hover:bg-accent",
                        pathname.startsWith("/services") ? "text-primary" : "text-foreground",
                      )}
                    >
                      {link.name} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="pl-4 mt-1 space-y-1">
                      {serviceLinks.map((service) => (
                        <React.Fragment key={service.name}>
                          {service.subServices ? (
                            <>
                              <Link
                                href={service.path}
                                className="block px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
                                onClick={toggleMenu}
                              >
                                {service.name}
                              </Link>
                              <div className="pl-4 mt-1 space-y-1">
                                {service.subServices.map((subService) => (
                                  <Link
                                    key={subService.name}
                                    href={subService.path}
                                    className="block px-3 py-2 text-xs rounded-md hover:bg-accent"
                                    onClick={toggleMenu}
                                  >
                                    {subService.name}
                                  </Link>
                                ))}
                              </div>
                            </>
                          ) : (
                            <Link
                              href={service.path}
                              className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
                              onClick={toggleMenu}
                            >
                              {service.name}
                            </Link>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.path}
                    className={cn(
                      "block px-3 py-2 text-base font-medium rounded-md hover:bg-accent",
                      pathname === link.path ? "text-primary" : "text-foreground",
                    )}
                    onClick={toggleMenu}
                  >
                    {link.name}
                  </Link>
                )}
              </React.Fragment>
            ))}

            {isLoggedIn &&
              userRole &&
              loggedInLinks[userRole as keyof typeof loggedInLinks]?.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-md hover:bg-accent",
                    pathname === link.path ? "text-primary" : "text-foreground",
                  )}
                  onClick={toggleMenu}
                >
                  {link.name}
                </Link>
              ))}

            <div className="pt-4 pb-3 border-t border-border">
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogOut}
                >
                  Log Out
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/auth/login" className="w-full" onClick={toggleMenu}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup" className="w-full" onClick={toggleMenu}>
                    <Button variant="default" className="w-full bg-[#af0e0e] hover:bg-[#8a0b0b]">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
