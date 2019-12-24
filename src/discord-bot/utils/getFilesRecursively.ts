import glob from 'glob';

export default function getFilesRecursively(
  folder: string,
  callback: (error: any, res: string[]) => void
) {
  glob(folder + '/**/*', callback);
}
