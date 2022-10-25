import User from "../models/User";

export default (user: User | null) => {
  if (!user || !user.profile_pic) {
    return `${process.env.PUBLIC_URL}/banner/pill1.webp`
  }

  return `${process.env.PUBLIC_URL}/banner/${user.profile_pic.replace('.png', '.webp')}`
}
