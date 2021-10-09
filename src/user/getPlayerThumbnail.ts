import * as Promise from "bluebird";
import { thumbnails } from "../api";
import getUser from "./getUser";

interface EligibleSizes {
    body: EligibleSizesData
    bust: EligibleSizesData
    headshot: EligibleSizesData
}

interface EligibleSizesData {
    sizes: Array<string>,
    endpoint: string
}

let eligibleSizes: EligibleSizes = {
    body: {
      sizes: ['30x30', '48x48', '60x60', '75x75', '100x100', '110x110', '140x140', '150x150', '150x200', '180x180', '250x250', '352x352', '420x420', '720x720'],
      endpoint: 'avatar'
    },
    bust: {
      sizes: ['48x48', '50x50', '60x60', '75x75', '100x100', '150x150', '180x180', '352x352', '420x420'],
      endpoint: 'avatar-bust'
    },
    headshot: {
      sizes: ['48x48', '50x50', '60x60', '75x75', '100x100', '110x110', '150x150', '180x180', '352x352', '420x420', '720x720'],
      endpoint: 'avatar-headshot'
    }
  }

async function getUserThumb(user: number | string, size: string, format: string, isCircular: boolean,  cropType: string) {
    return new Promise(async (resolve, reject) => {

      cropType = cropType.toLowerCase()
      if (!Object.keys(eligibleSizes).includes(cropType)) {
        throw new Error(`Invalid cropping type provided: ${cropType} | Use: ${Object.keys(eligibleSizes).join(', ')}`)
      }
      const { sizes, endpoint } = eligibleSizes[cropType]
      // Validate size
      size = size || sizes[sizes.length - 1]
      if (typeof size === 'number') {
        size = `${size}x${size}`
      }
      if (!sizes.includes(size)) {
        throw new Error(`Invalid size parameter provided: ${size} | [${cropType.toUpperCase()}] Use: ${sizes.join(', ')}`)
      }
      if (format.toLowerCase() !== 'png' && format.toLowerCase() !== 'jpeg') {
        throw new Error(`Invalid image type provided: ${format} | Use: png, jpeg`)
      }

      let avatarResponse = await thumbnails.get(`v1/users/${endpoint}?userIds=${user}&size=${size}&format=${format}&isCircular=${isCircular}`)


      return resolve({
          "Thumbnail": avatarResponse.data.data[0].imageUrl
      })

})
}

export default async function (user: number | string, size: string, format: string, isCircular: boolean, cropType = 'body'): Promise<Object> {
    return new Promise(async (resolve, reject) => {
        if (Number(user)) {
            getUserThumb(user, size, format, isCircular, cropType).catch(reject).then(resolve);
        } else {
            getUser(user).then(async (user) => {
                if (user.id) {
                    getUserThumb(user.id, size, format, isCircular,  cropType = 'body').catch(reject).then(resolve);
                } else {
                    reject(new Error('User not found'));
                }
            });
        }
    })
}