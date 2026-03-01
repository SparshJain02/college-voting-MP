import { z } from "zod";

export const authSchema = z.object({
  username: z
    .string("Username is missing")
    .max(50, "Username too long")
    .toLowerCase()
    .trim(),

  email: z
    .string("Email is missing")
    .email("Invalid email format")
    .regex(/^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/, 
      "Please Enter Your College Email Id"),

  password: z
    .string("Password is missing")
    .min(5, "Password must be at least 5 characters")
    .max(100, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  rollno: z
    .string("Roll Number is missing")
    .min(10, "Invalid Roll Number"),

  course: z
  .string("Course is missing")
  .toLowerCase()
  .refine(val => ["bca", "mca", "bsc", "btech"].includes(val), {
    message: "Invalid course"
  })
});
export const loginSchema = authSchema.pick({
  email:true,rollno: true,password: true
})