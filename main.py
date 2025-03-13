import subprocess
import hashlib
import pathlib
import shutil
import time
import configparser
from bs4 import BeautifulSoup


def get_hash(path):
    try:
        with open(path, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except FileNotFoundError:
        return '0'


config = configparser.ConfigParser()
if not config.read('config.ini'):
    config['original'] = {
        'hash': get_hash(fr'{str(pathlib.Path.home())}\AppData\Local\Programs\YandexMusic\resources\app.asar')}
    config['patched'] = {'hash': '0'}
    config.write(open('config.ini', 'w'))
else:
    config.read('config.ini')


def main():
    if config['original']['hash'] != get_hash('resources/original.asar'):
        shutil.copy(fr'{str(pathlib.Path.home())}\AppData\Local\Programs\YandexMusic\resources\app.asar',
                    'resources/original.asar')
        print("copied original asar")
    if config['patched']['hash'] == get_hash(
            fr'{str(pathlib.Path.home())}\AppData\Local\Programs\YandexMusic\resources\app.asar'):
        return "already patched"
    subprocess.run(['bin/asar.exe', 'e',
                    fr'{str(pathlib.Path.home())}\AppData\Local\Programs\YandexMusic\resources\app.asar', './app'])
    for dir_name in pathlib.Path('resources').iterdir():
        shutil.copytree(dir_name, f'app/node_modules/{dir_name.name}') if dir_name.is_dir() else None
    shutil.copy('resources/settings.js', 'app/app/settings.js')
    shutil.copy('resources/discord.js', 'app/app/discord.js')
    shutil.copy('resources/events.js', 'app/main/events.js')
    with open('app/app/index.html', 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    soup.head.append(soup.new_tag('script', src='/discord.js')) if not soup.head.find('script',
                                                                                      {'src': '/discord.js'}) else None
    soup.head.append(soup.new_tag('script', src='/settings.js')) if not soup.head.find('script', {
        'src': '/settings.js'}) else None
    with open('app/app/index.html', 'w', encoding='utf-8') as f:
        f.write(str(soup))
    subprocess.run(['bin/asar.exe', 'p', './app',
                    fr'{str(pathlib.Path.home())}\AppData\Local\Programs\YandexMusic\resources\app.asar'])
    shutil.rmtree('app')
    config['patched']['hash'] = get_hash(
        fr'{str(pathlib.Path.home())}\AppData\Local\Programs\YandexMusic\resources\app.asar')
    config.write(open('config.ini', 'w'))
    return 'Done patching'


if __name__ == '__main__':
    print(main())
    time.sleep(3)
