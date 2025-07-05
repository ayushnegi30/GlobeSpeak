import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShipWheelIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { signup, sendOtp } from "../lib/api";

const SignUpPage = () => {
  const [signupData, setsignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signupMutation, isPending } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Signup successful!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Signup failed");
    },
  });

  const handleSignup = (e) => {
    e.preventDefault();

    if (!signupData.fullName || !signupData.email || !signupData.password) {
      toast.error("All fields are required");
      return;
    }

    if (!otp) {
      toast.error("Please enter the OTP sent to your email");
      return;
    }

    console.log("📦 Signup Payload:", { ...signupData, otp });

    signupMutation({ ...signupData, otp });
  };

  const handleSendOtp = async () => {
    try {
      if (!signupData.email) {
        toast.error("Please enter your email first");
        return;
      }

      await sendOtp(signupData.email);
      toast.success("OTP sent to your email!");
      setOtpSent(true);
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="cupcake"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from bg-primary to-secondary tracking-wider">
              GlobeSpeak
            </span>
          </div>

          <form onSubmit={handleSignup}>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Create an Account</h2>
                <p className="text-sm opacity-70">"New convo, new bestie. Let's go!"</p>
              </div>

              <div className="space-y-3">
                {/* Full Name */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered w-full"
                    value={signupData.fullName}
                    onChange={(e) => setsignupData({ ...signupData, fullName: e.target.value })}
                    required
                  />
                </div>

                {/* Email + OTP Button */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setsignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-primary"
                      onClick={handleSendOtp}
                    >
                      Send OTP
                    </button>
                  </div>
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">OTP</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="input input-bordered w-full"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Password */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="********"
                    className="input input-bordered w-full"
                    value={signupData.password}
                    onChange={(e) => setsignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                  <p className="text-xs opacity-70 mt-1">Password must be at least 6 characters long</p>
                </div>
              </div>

              <button className="btn btn-primary w-full" type="submit">
                {isPending ? "Signing Up..." : "Create Account"}
              </button>

              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i2.png" alt="Language connection illustration" className="w-full h-full" />
            </div>
            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">"Cross-lingual DMs? We got you."</h2>
              <p className="opacity-70">Join the convo. We'll handle the translation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
