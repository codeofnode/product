set -e

TOMERGE=
TOTEST=1
TOPUSH=

if [[ $1 == *m* ]]; then
  TOMERGE=1
fi

if [[ $1 == *p* ]]; then
  TOTEST=
fi

if [[ $1 == *s* ]]; then
  TOPUSH=1
fi

if [[ -n $(git status -s) ]]; then
  echo "There are uncommitted files. Aborting!!!"
  exit 1
fi

current_branch() {
  git symbolic-ref --short HEAD
}
saved_branch=$(current_branch)

local_branches() {
  git for-each-ref --format="%(refname:short)" refs/heads
}
local_brs=$(local_branches)

list_brs=()
filter_branches(){
  list_brs=()
  for branch in $local_brs; do
    if [[ $branch == $1 ]]; then
      list_brs+=("${branch}")
    fi
  done
}

filter_branches "*-dev"
echo "Dev Tools are : ${list_brs[*]}"
echo

TOOL=product
BRANCH=dev

current_version() {
  node -e "console.log(require('./scripts/conf').version.split('.').shift())"
}

name=$(node -e "console.log(require('./scripts/conf').name)")
version=$(current_version)
if [ "$name" == "product" ]; then
  if git show-ref --quiet refs/heads/v$((version + 1)); then
    BRANCH=master
  fi
  par_br=v$version
else
  TOOL=$name
  if git show-ref --quiet "refs/heads/${name}-v$((version + 1))"; then
    BRANCH=master
  fi
  par_br="${name}-v${version}"
fi

merge_me(){
  local cr=$(current_branch)
  printf "====> %20s" "$cr" && echo " += $1"
  if [ "$TOMERGE" == "1" ]; then
    git merge --no-edit $1
    if [ "$TOTEST" == "1" ]; then
      npm test
      npm run build
      npm run prodtest
    fi
  fi
}

merge_peers(){
  filter_branches $1
  for peer in "${list_brs[@]}"; do
    if [ "${peer}" != "$2" ]; then
      git checkout $peer
      merge_me $2
    fi
  done
}

common(){
  cv=$(current_version)
  ci=$(current_branch)
  sep2="-"
  devormaster=dev
  ctp=$1
  sep=$2
	git checkout ${ctp}${sep}v${cv}
  merge_me $ci
	git checkout ${ctp}${sep}${devormaster}
	merge_me ${ctp}${sep}v${cv}
  merge_peers "${ctp}${sep}v${cv}${sep2}*" ${ctp}${sep}v${cv}
}

common_master(){
  cv=$(current_version)
  ci=$(current_branch)
	ctp=$TOOL
	sep="-"
	git checkout ${ctp}${sep}v${cv}
	merge_me $ci
  git checkout $1
  mcv=$(current_version)
  if [ "$cv" == "$mcv" ]; then
	  devormaster=""
    sep=""
    merge_me ${ctp}${sep}v${cv}
  fi
}

if [ "$TOOL" != "product" ] && [ "$BRANCH" == "dev" ]; then
  common $TOOL -
elif [ "$TOOL" == "product" ] && [ "$BRANCH" == "dev" ]; then
  common
  filter_branches "*-dev"
  for peer in "${list_brs[@]}"; do
    git checkout ${peer};
    cv=$(current_version)
    merge_me dev
    tl=${peer::-4}
    sep="-"
    sep2="-"
    git checkout ${tl}${sep}v${cv};
    merge_me ${peer}
    merge_peers "${tl}${sep}v${cv}${sep2}*" ${tl}${sep}v${cv}
  done
  if [[ $1 == *-t-* ]]; then
    common_master master
  fi
elif [ "$TOOL" != "product" ] && [ "$BRANCH" == "master" ]; then
  common_master $TOOL
elif [ "$TOOL" == "product" ] && [ "$BRANCH" == "master" ]; then
  common_master master
fi

echo
[[ "${saved_branch}" != "$(current_branch)" ]] && git checkout "${saved_branch}"
if [ "$TOPUSH" == "1" ] && [ "$TOMERGE" == "1" ]; then
  git push origin --all
fi
