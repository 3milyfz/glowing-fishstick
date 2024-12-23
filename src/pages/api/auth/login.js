import { verifyLogin } from "../../../../utils/auth";
import { generateWebToken, generateRefreshToken } from "../../../../utils/auth";

export default async function handler(req, res) {
  /*
    Return Web Token if login is successful
  */

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { username, password } = req.body;
  // console.log(username, password);
  const user = await verifyLogin(username, password);

  if (user !== null) {
    const webToken = generateWebToken(user.username, user.isAdmin, user.id);
    const refreshToken = generateRefreshToken(
      user.username,
      user.isAdmin,
      user.id,
    );
    return res
      .status(200)
      .json({ accessToken: webToken, refreshToken: refreshToken });
  } else {
    return res.status(401).json({ error: "Failed to login." });
  }
}
