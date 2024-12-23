import { refreshUserToken } from "../../../../utils/auth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const accessToken = refreshUserToken(req);
  if (accessToken !== null) {
    return res.status(200).json({ accessToken: accessToken });
  } else {
    return res.status(401).json({ error: "Invalid Refresh Token" });
  }
}
