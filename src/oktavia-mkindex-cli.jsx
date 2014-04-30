import "console.jsx";
import "js/nodejs.jsx";

import "./oktavia.jsx";
import "./htmlparser.jsx";
import "./csvparser.jsx";
import "./textparser.jsx";
import "./base64.jsx";

import "getopt.jsx";
import "stemmer.jsx";
import "danish-stemmer.jsx";
import "dutch-stemmer.jsx";
import "english-stemmer.jsx";
import "finnish-stemmer.jsx";
import "french-stemmer.jsx";
import "german-stemmer.jsx";
import "hungarian-stemmer.jsx";
import "italian-stemmer.jsx";
import "norwegian-stemmer.jsx";
import "porter-stemmer.jsx";
import "portuguese-stemmer.jsx";
import "romanian-stemmer.jsx";
import "russian-stemmer.jsx";
import "spanish-stemmer.jsx";
import "swedish-stemmer.jsx";
import "turkish-stemmer.jsx";

class _Main
{
    static function usage () : void
    {
        console.log([
            "usage: oktavia-mkindex-cli [options]",
            "",
            "Common Options:",
            " -i, --input [input folder/file ] : Target files to search. .html, .csv, .txt are available.",
            " -o, --output [outputfolder]      : Directory that will store output files.",
            "                                  : This is a relative path from root.",
            "                                  : Default value is 'search'. ",
            " -t, --type [type]                : Export type. 'index', 'base64', 'cmd', 'js(default)',",
            "                                  : 'commonjs' 'web', are available.",
            "                                  : 'index' is a just index file. 'cmd' is a base64 code with search program.",
            "                                  : Others are base64 source code style output.",
            " -m, --mode [mode]                : Mode type. 'html', 'csv', 'text' are available.",
            " -c, --cache-density [percent]    : Cache data density. It effects file size and search speed.",
            "                                  : 100% become four times of base index file size. Default value is 5%.",
            "                                  : Valid value is 0.1% - 100%.",
            " -n, --name [function]            : A variable name for 'js' output or property name",
            "                                  : for 'js' and 'commonjs'. Default value is 'searchIndex'.",
            " -q, --quiet                      : Hide detail information.",
            " -h, --help                       : Display this message.",
            "",
            "HTML Mode Options:",
            " -r, --root  [document root]      : Document root folder. Default is current. ",
            "                                  : Indexer creates result file path from this folder.",
            " -p, --prefix [directory prefix]  : Directory prefix for a document root from a server root.",
            "                                  : If your domain is example.com and 'manual' is passed,",
            "                                  : document root become http://example.com/manual/.",
            "                                  : It effects search result URL. Default value is '/'.",
            " -u, --unit [search unit]         : 'file', 'h1'-'h6'. Default value is 'file'.",
            " -f, --filter [target tag]        : Only contents inside this tag is indexed.",
            "                                  : Default value is \"article,#content,#main,div.body\".",
            " -s, --stemmer [algorithm]        : Select stemming algorithm.",
            //" -w, --word-splitter [splitter]   : Use optional word splitter.",
            //"                                  : 'ts' (TinySegmenter for Japanese) is available",
            " -I, --ignore-case                : ignore case distinctions.",
            "",
            "Text Mode Options:",
            " -r, --root  [document root]      : Document root folder. Default is current. ",
            "                                  : Indexer creates result file path from this folder.",
            " -s, --stemmer [algorithm]        : Select stemming algorithm.",
            //" -w, --word-splitter [splitter]   : Use optional word splitter.",
            //"                                  : 'ts' (TinySegmenter for Japanese) is available",
            " -u, --unit [search unit]         : file, block, line. Default value is 'file'.",
            "",
            "Supported Stemmer Algorithms:",
            "  danish, dutch, english, finnish, french german, hungarian italian",
            "  norwegian, porter, portuguese, romanian, russian, spanish, swedish, turkish"
        ].join('\n'));
    }

    static function main(args : string[]) : void
    {
        _Main.run(args);
        if (JSX.profilerIsRunning())
        {
            JSX.postProfileResults("http://localhost:2012/post-profile");
        }
    }

    static function run (args : string[]) : void
    {
        console.log("Search Engine Oktavia - Index Generator\n");

        var inputs = [] : string[];
        var root = process.cwd();
        var prefix = '/';
        var output : Nullable.<string> = null;
        var showhelp = false;
        var notrun = false;
        var unit = 'file';
        var type = 'js';
        var mode = '';
        var verbose = true;
        var ignoreCase = false;
        var filter = [] : string[];
        var algorithm : Nullable.<string> = null;
        //var wordsplitter : Nullable.<string> = null;
        var cacheDensity : number = 5.0;
        var name = null : Nullable.<string>;
        var validModes = ['html', 'csv', 'text'];
        var validUnitsForHTML = ['file', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        var validUnitsForText = ['file', 'block', 'line'];
        var validStemmers = [
            'danish', 'dutch', 'english', 'finnish', 'french', 'german', 'hungarian',
            'italian', 'norwegian', 'porter', 'portuguese', 'romanian', 'russian',
            'spanish', 'swedish', 'turkish'
        ];
        var validTypes = ['index', 'base64', 'cmd', 'js', 'commonjs', 'web'];
        //var validWordSplitters = ['ts'];

        var optstring = "n:(name)q(quiet)m:(mode)i:(input)r:(root)p:(prefix)o:(output)h(help)u:(unit)f:(filter)s:(stemmer)w:(word-splitter)t:(type)c:(cache-density)I(ignore-case)";
        var parser = new BasicParser(optstring, args);
        var opt = parser.getopt();
        while (opt)
        {
            switch (opt.option)
            {
            case "m":
                if (validModes.indexOf(opt.optarg) == -1)
                {
                    console.error("Option m/mode should be 'html', 'csv', 'text'.");
                    notrun = true;
                }
                mode = opt.optarg;
                break;
            case "i":
                inputs.push(opt.optarg);
                break;
            case "r":
                root = node.path.resolve(opt.optarg);
                break;
            case "p":
                prefix = opt.optarg;
                break;
            case "n":
                name = opt.optarg;
                break;
            case "o":
                output = opt.optarg;
                if (output.slice(0, 1) == '/')
                {
                    output = output.slice(1);
                }
                break;
            case "h":
                showhelp = true;
                break;
            case "q":
                verbose = false;
                break;
            case "u":
                unit = opt.optarg;
                break;
            case "f":
                var items = opt.optarg.split(',');
                for (var i in items)
                {
                    filter.push(items[i]);
                }
                break;
            case "t":
                if (validTypes.indexOf(opt.optarg) == -1)
                {
                    console.error('Option -t/--type is invalid.');
                    notrun = true;
                }
                else
                {
                    type = opt.optarg;
                }
                break;
            case "s":
                if (validStemmers.indexOf(opt.optarg) == -1)
                {
                    console.error('Option -s/--stemmer is invalid.');
                    notrun = true;
                }
                else
                {
                    algorithm = opt.optarg;
                }
                break;
            /*case "w":

                break;*/
            case "I":
                ignoreCase = true;
                break;
            case "c":
                var match = /(\d+\.?\d*)/.exec(opt.optarg);
                if (match)
                {
                    var tmpValue = match[1] as number;
                    if (0.1 <= tmpValue && tmpValue <= 100)
                    {
                        cacheDensity = tmpValue;
                    }
                    else
                    {
                        console.error('Option -c/--cache-density should be in 0.1 - 100.');
                        notrun = true;
                    }
                }
                else
                {
                    console.error('Option -c/--cache-density is invalid.');
                    notrun = true;
                }
                break;
            case "?":
                notrun = true;
                break;
            }
            opt = parser.getopt();
        }
        var inputTextFiles = [] : string[];
        var inputHTMLFiles = [] : string[];
        var inputCSVFiles = [] : string[];
        if (filter.length == 0)
        {
            filter = ['article', '#content', '#main', 'div.body'];
        }
        for (var i in inputs)
        {
            var input = inputs[i];
            if (!node.fs.existsSync(input))
            {
                console.error("Following input folder/file doesn't exist: " + input);
                notrun = true;
            }
            else
            {
                var stat = node.fs.statSync(input);
                if (stat.isFile())
                {
                    _Main._checkFileType(node.path.resolve(input), inputTextFiles, inputHTMLFiles, inputCSVFiles);
                }
                else if (stat.isDirectory())
                {
                    _Main._checkDirectory(input, inputTextFiles, inputHTMLFiles, inputCSVFiles);
                }
                else
                {
                    console.error("Following input is not folder or file: " + input);
                    notrun = true;
                }
            }
        }
        if (inputTextFiles.length == 0 && inputHTMLFiles.length == 0 && inputCSVFiles.length == 0 || !mode)
        {
            showhelp = true;
        }
        if (showhelp)
        {
            _Main.usage();
        }
        else if (!notrun)
        {
            var stemmer : Nullable.<Stemmer> = null;
            if (algorithm)
            {
                stemmer = _Main._createStemmer(algorithm);
            }
            var dump = null : Nullable.<string>;
            switch (mode)
            {
            case 'html':
                var unitIndex = validUnitsForHTML.indexOf(unit);
                if (unitIndex == -1)
                {
                    console.error('Option -u/--unit should be file, h1, h2, h3, h4, h5, h6. But ' + unit);
                }
                else
                {
                    var htmlParser = new HTMLParser(unitIndex, root, prefix, filter, stemmer, ignoreCase);
                    for (var i = 0; i < inputHTMLFiles.length; i++)
                    {
                        htmlParser.parse(inputHTMLFiles[i]);
                    }
                    console.log('generating index...');
                    if (verbose)
                    {
                        console.log('');
                    }
                    dump = htmlParser.dump(cacheDensity, verbose);
                }
                break;
            case 'csv':
                var csvParser = new CSVParser(root, stemmer);
                for (var i in inputCSVFiles)
                {
                    csvParser.parse(inputCSVFiles[i]);
                }
                break;
            case 'text':
                if (validUnitsForText.indexOf(unit) == -1)
                {
                    console.error('Option u/unit should be file, block, line. But ' + unit);
                }
                else
                {
                    var textParser = new TextParser(unit, root, stemmer);
                    for (var i in inputTextFiles)
                    {
                        textParser.parse(inputTextFiles[i]);
                    }
                    dump = textParser.dump(cacheDensity, verbose);
                }
                break;
            }
            if (dump)
            {
                var indexFilePath = "";
                switch (type)
                {
                case 'index':
                    if (output == null)
                    {
                        output = 'search';
                    }
                    indexFilePath = node.path.resolve(root, output, 'searchindex.okt');
                    var dirPath = node.path.dirname(indexFilePath);
                    _Main._mkdirP(dirPath);
                    console.log("writing index in binary...", indexFilePath);
                    node.fs.writeFileSync(indexFilePath, dump, "utf16le");
                    break;
                case 'base64':
                    if (output == null)
                    {
                        output = 'search';
                    }
                    indexFilePath = node.path.resolve(root, output, 'searchindex.okt.b64');
                    var dirPath = node.path.dirname(indexFilePath);
                    _Main._mkdirP(dirPath);
                    console.log("writing index in base64...", indexFilePath);
                    node.fs.writeFileSync(indexFilePath, Base64.btoa(dump), "utf8");
                    break;
                case 'cmd':
                    if (output == null)
                    {
                        output = 'index-search-cli';
                    }
                    var srcLines = node.fs.readFileSync(node.path.join(node.__dirname, 'oktavia-cli-runtime.js'), 'utf8').split('\n');
                    var latinString = Base64.to8bitString(dump);
                    var base64String = Base64.btoa(latinString);
                    var indexContent = 'searchIndex = "' + base64String + '";';
                    srcLines.splice(1, 0, indexContent);
                    console.log("writing index for cli...", output);
                    node.fs.writeFileSync(output, srcLines.join('\n'), 'utf8');
                    node.fs.chmodSync(output, '0755');
                    break;
                case 'web':
                    if (output == null)
                    {
                        output = 'searchindex.js';
                    }
                    var srcLines = node.fs.readFileSync(node.path.join(node.__dirname, "web", 'oktavia-web-runtime.js'), 'utf8').split('\n');
                    var latinString = Base64.to8bitString(dump);
                    var base64String = Base64.btoa(latinString);
                    var indexContent = 'searchIndex = "' + base64String + '";';
                    srcLines.splice(0, 0, indexContent);
                    console.log("writing index for web...", output);
                    node.fs.writeFileSync(output, srcLines.join('\n'), 'utf8');
                    break;
                case 'js':
                    if (output == null)
                    {
                        output = 'search';
                    }
                    indexFilePath = node.path.resolve(root, output, 'searchindex.js');
                    var dirPath = node.path.dirname(indexFilePath);
                    _Main._mkdirP(dirPath);
                    if (name == null)
                    {
                        name = 'searchIndex';
                    }
                    var contents = [
                        '// Oktavia Search Index',
                        'var ' + name + ' = "' + Base64.btoa(dump) + '";', ''
                    ];
                    console.log("writing index in js...", indexFilePath);
                    node.fs.writeFileSync(indexFilePath, contents.join('\n'), "utf8");
                    break;
                case 'commonjs':
                    if (output == null)
                    {
                        output = 'search';
                    }
                    indexFilePath = node.path.resolve(root, output, 'searchindex.js');
                    var dirPath = node.path.dirname(indexFilePath);
                    _Main._mkdirP(dirPath);
                    if (name == null)
                    {
                        name = 'searchIndex';
                    }
                    var contents = [
                        '// Oktavia Search Index',
                        'exports.' + name + ' = "' + Base64.btoa(dump) + '";', ''
                    ];
                    console.log("writing index in js...", indexFilePath);
                    node.fs.writeFileSync(indexFilePath, contents.join('\n'), "utf8");
                    break;
                }
            }
        }
    }

    static function _checkFileType (path : string, texts : string[], HTMLs : string[], CSVs : string[]) : void
    {
        var match = path.match(/(.*)\.(.*)/);
        if (match && match[1])
        {
            switch (match[2].toLowerCase())
            {
            case 'html':
            case 'htm':
                HTMLs.push(path);
                break;
            case 'csv':
                CSVs.push(path);
                break;
            default:
                texts.push(path);
            }
        }
    }

    static function _checkDirectory (path : string, texts : string[], HTMLs : string[], CSVs : string[]) : void
    {
        var files = node.fs.readdirSync(path);
        for (var j in files)
        {
            var filepath = node.path.resolve(path, files[j]);
            var stat = node.fs.statSync(filepath);
            if (stat.isFile())
            {
                _Main._checkFileType(filepath, texts, HTMLs, CSVs);
            }
            else if (stat.isDirectory())
            {
                _Main._checkDirectory(filepath, texts, HTMLs, CSVs);
            }
        }
    }

    static function _mkdirP (path : string) : void
    {
        if (node.fs.existsSync(path))
        {
            return;
        }
        _Main._mkdirP(node.path.dirname(path));
        node.fs.mkdirSync(path);
    }

    static function _createStemmer (algorithm : string) : Stemmer
    {
        var stemmer : Stemmer;
        switch (algorithm.toLowerCase())
        {
        case "danish":
            stemmer = new DanishStemmer();
            break;
        case "dutch":
            stemmer = new DutchStemmer();
            break;
        case "english":
            stemmer = new EnglishStemmer();
            break;
        case "finnish":
            stemmer = new FinnishStemmer();
            break;
        case "french":
            stemmer = new FrenchStemmer();
            break;
        case "german":
            stemmer = new GermanStemmer();
            break;
        case "hungarian":
            stemmer = new HungarianStemmer();
            break;
        case "italian":
            stemmer = new ItalianStemmer();
            break;
        case "norwegian":
            stemmer = new NorwegianStemmer();
            break;
        case "porter":
            stemmer = new PorterStemmer();
            break;
        case "portuguese":
            stemmer = new PortugueseStemmer();
            break;
        case "romanian":
            stemmer = new RomanianStemmer();
            break;
        case "russian":
            stemmer = new RussianStemmer();
            break;
        case "spanish":
            stemmer = new SpanishStemmer();
            break;
        case "swedish":
            stemmer = new SwedishStemmer();
            break;
        case "turkish":
            stemmer = new TurkishStemmer();
            break;
        default:
            stemmer = new EnglishStemmer();
            break;
        }
        return stemmer;
    }
}
